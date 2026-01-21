import { useState } from 'react';
import { useProteinStore } from '../../../stores/useProteinStore';
import { exportToPDB, parsePDBToResidues } from '../../../utils/pdbExporter';

interface SearchResult {
    target: string;
    score: number;
    tname: string;
    qlen: number;
    tlen: number;
}

interface StructureSearchProps {
    onClose?: () => void;
}

export function StructureSearch({ onClose }: StructureSearchProps) {
    const { residues, setResidues } = useProteinStore();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingPdb, setLoadingPdb] = useState<string | null>(null);

    const handleSearch = async () => {
        if (residues.length < 3) {
            setError('Please add at least 3 residues to search');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            // Export current structure to PDB
            const { pdbString, isValid, warnings } = exportToPDB(residues);

            if (!isValid) {
                setError('Failed to export structure: ' + warnings.join(', '));
                setIsLoading(false);
                return;
            }

            // Create form data for Foldseek API
            const formData = new FormData();
            const pdbBlob = new Blob([pdbString], { type: 'text/plain' });
            formData.append('q', pdbBlob, 'query.pdb');
            formData.append('mode', '3diaa');
            formData.append('database[]', 'pdb100');

            // Step A: Submit ticket
            const ticketResponse = await fetch('https://search.foldseek.com/api/ticket', {
                method: 'POST',
                body: formData,
            });

            if (!ticketResponse.ok) {
                throw new Error(`Foldseek API error: ${ticketResponse.status}`);
            }

            const ticketData = await ticketResponse.json();
            const ticketId = ticketData.id;

            if (!ticketId) {
                throw new Error('No ticket ID received from Foldseek');
            }

            // Step B: Poll for completion
            let status = 'PENDING';
            let resultData: any = null;

            while (status !== 'COMPLETE' && status !== 'ERROR') {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const statusResponse = await fetch(`https://search.foldseek.com/api/ticket/${ticketId}`);
                const statusData = await statusResponse.json();
                status = statusData.status;

                if (status === 'COMPLETE') {
                    resultData = statusData;
                } else if (status === 'ERROR') {
                    throw new Error('Search failed: ' + (statusData.error || 'Unknown error'));
                }
            }

            // Step C: Parse results
            if (resultData && resultData.result && resultData.result.results) {
                const searchResults: SearchResult[] = [];

                for (const db of resultData.result.results) {
                    if (db.alignments) {
                        for (const alignment of db.alignments.slice(0, 10)) {
                            searchResults.push({
                                target: alignment.target.split('_')[0] || alignment.target,
                                score: alignment.score || 0,
                                tname: alignment.tname || 'Unknown',
                                qlen: alignment.qlen || 0,
                                tlen: alignment.tlen || 0,
                            });
                        }
                    }
                }

                if (searchResults.length === 0) {
                    setError('No similar structures found');
                } else {
                    setResults(searchResults);
                }
            } else {
                setError('No results returned from search');
            }
        } catch (err) {
            console.error('Structure search failed:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadResult = async (pdbId: string) => {
        setLoadingPdb(pdbId);

        try {
            // Fetch PDB from RCSB
            const response = await fetch(`https://files.rcsb.org/download/${pdbId}.pdb`);

            if (!response.ok) {
                throw new Error(`Failed to fetch PDB: ${response.status}`);
            }

            const pdbString = await response.text();
            const newResidues = parsePDBToResidues(pdbString);

            if (newResidues.length === 0) {
                throw new Error('No valid residues found in PDB file');
            }

            // Center the structure
            const avgX = newResidues.reduce((sum, r) => sum + r.position[0], 0) / newResidues.length;
            const avgY = newResidues.reduce((sum, r) => sum + r.position[1], 0) / newResidues.length;
            const avgZ = newResidues.reduce((sum, r) => sum + r.position[2], 0) / newResidues.length;

            const centeredResidues = newResidues.map(r => ({
                ...r,
                position: [
                    r.position[0] - avgX,
                    r.position[1] - avgY,
                    r.position[2] - avgZ,
                ] as [number, number, number],
            }));

            setResidues(centeredResidues);
            onClose?.();
        } catch (err) {
            console.error('Failed to load PDB:', err);
            setError(err instanceof Error ? err.message : 'Failed to load structure');
        } finally {
            setLoadingPdb(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#12121a] border border-white/10 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Find Similar Structures</h2>
                        <p className="text-sm text-gray-400">Search real proteins matching your design</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* Search button */}
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || residues.length < 3}
                        className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 
                       text-white font-medium rounded-lg transition-colors
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Searching Foldseek...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search for Similar Structures
                            </>
                        )}
                    </button>

                    {residues.length < 3 && (
                        <p className="text-sm text-yellow-500 text-center">
                            Add at least 3 residues to your structure to search
                        </p>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-400">
                                Found {results.length} similar structures:
                            </h3>

                            {results.map((result, i) => (
                                <div
                                    key={`${result.target}-${i}`}
                                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 
                             border border-white/5 rounded-lg transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-mono font-bold">{result.target}</span>
                                            <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                                                Score: {result.score.toFixed(1)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 truncate mt-1">{result.tname}</p>
                                    </div>

                                    <button
                                        onClick={() => handleLoadResult(result.target)}
                                        disabled={loadingPdb === result.target}
                                        className="ml-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600
                               text-white text-sm font-medium rounded-lg transition-colors
                               disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {loadingPdb === result.target ? (
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            'Load'
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    <p className="text-xs text-gray-500 text-center">
                        Powered by <a href="https://search.foldseek.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Foldseek</a> •
                        Structures from <a href="https://www.rcsb.org" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">RCSB PDB</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
