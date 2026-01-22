import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProteinStore } from '../../../stores/useProteinStore';
import { searchFoldseek, fetchPDBStructure, type FoldseekResult } from '../../../services/proteinService';

interface StructureSearchProps {
    onClose?: () => void;
}

export function StructureSearch({ onClose }: StructureSearchProps) {
    const { residues, setResidues } = useProteinStore();
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<FoldseekResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadingPdb, setLoadingPdb] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const searchResults = await searchFoldseek(residues);
            setResults(searchResults);
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
            const centeredResidues = await fetchPDBStructure(pdbId);
            setResidues(centeredResidues);
            onClose?.();
        } catch (err) {
            console.error('Failed to load PDB:', err);
            setError(err instanceof Error ? err.message : 'Failed to load structure');
        } finally {
            setLoadingPdb(null);
        }
    };

    // Filter results by search query
    const filteredResults = results.filter(r =>
        searchQuery === '' ||
        r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-[#0a0a0f]/95 backdrop-blur-3xl rounded-[2.5rem] w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden ring-1 ring-white/5"
            >
                {/* Header */}
                <div className="relative h-32 flex items-center px-10 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent opacity-50" />
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />

                    <div className="relative flex-1">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Structural Search</h2>
                        <p className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mt-1">Foldseek Alignment v1.0</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="relative w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all group"
                    >
                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Input Console */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl group-focus-within:bg-indigo-500/10 transition-colors" />
                        <div className="relative">
                            <svg
                                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500/40"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="FILTER BY PDB ID OR PROTEIN NAME..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-32 text-xs font-black text-white placeholder:text-gray-700 focus:bg-white/10 transition-all outline-none uppercase tracking-widest ring-1 ring-white/5 focus:ring-indigo-500/30"
                            />
                            {results.length === 0 && !isLoading && (
                                <button
                                    onClick={handleSearch}
                                    disabled={residues.length < 3}
                                    className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 disabled:grayscale text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                                >
                                    GENERATE MATCHES
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Monitor */}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="py-12 flex flex-col items-center gap-6"
                            >
                                <div className="relative w-20 h-20">
                                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                                    <motion.div
                                        className="absolute inset-x-0 top-0 h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] rounded-full"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    />
                                    <div className="absolute inset-4 border-2 border-dashed border-purple-500/30 rounded-full animate-[spin_4s_linear_infinite]" />
                                </div>
                                <div className="text-center space-y-2">
                                    <span className="text-[11px] text-white font-black uppercase tracking-[0.5em] animate-pulse">Scanning Bio-Databases</span>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Foldseek Alignment in progress...</p>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-red-400 text-xs font-black uppercase">Operation Error</h4>
                                    <p className="text-red-400/60 text-[10px] uppercase font-bold">{error}</p>
                                </div>
                            </motion.div>
                        ) : results.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Signal Detected ({filteredResults.length})</span>
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Click to deploy structure</span>
                                </div>

                                <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                    {filteredResults.map((result, i) => (
                                        <motion.div
                                            key={`${result.target}-${i}`}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="group relative flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-indigo-500/30 transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-indigo-500/10 transition-colors">
                                                    <span className="text-white font-black text-xs group-hover:text-indigo-400 transition-colors uppercase tracking-widest">{result.target}</span>
                                                    <div className="w-4 h-px bg-white/10 mt-1" />
                                                    <span className="text-[8px] text-gray-600 mt-1 font-black">PDB ID</span>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-white font-black uppercase group-hover:text-indigo-400 transition-colors truncate max-w-[200px]">{result.tname}</span>
                                                        <div className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-black uppercase">Score: {result.score.toFixed(0)}</div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                        <span>QLEN: {result.qlen}</span>
                                                        <div className="w-1 h-1 rounded-full bg-gray-700" />
                                                        <span>TLEN: {result.tlen}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleLoadResult(result.target)}
                                                disabled={loadingPdb === result.target}
                                                className={`
                                                    h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                                                    ${loadingPdb === result.target
                                                        ? 'bg-white/5 text-gray-600'
                                                        : 'bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/20'
                                                    }
                                                `}
                                            >
                                                {loadingPdb === result.target ? (
                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                ) : (
                                                    'DEPLOY'
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 rounded-full border border-dashed border-white/10 flex items-center justify-center grayscale opacity-20">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.308a1 1 0 01-1.147-.142L8 13l-1.557-1.557a1 1 0 01-.142-1.147l.308-.618a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-.547-1.022L6 2" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">No Signal Detected</h5>
                                    <p className="text-white/20 text-[9px] uppercase font-bold">Adjust your sequence or initialize search</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Console */}
                <div className="px-10 py-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Foldseek API</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">RCSB PDB</span>
                        </div>
                    </div>

                    <div className="text-[8px] text-gray-700 font-black uppercase tracking-widest">
                        System Status: <span className="text-indigo-500/50">Optimal</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
