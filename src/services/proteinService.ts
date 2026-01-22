import type { Residue } from '../stores/useProteinStore';
import { exportToPDB, parsePDBToResidues } from '../utils/pdbExporter';

export interface FoldseekResult {
    target: string;
    score: number;
    tname: string;
    qlen: number;
    tlen: number;
}

/**
 * Search for similar protein structures using the Foldseek API.
 * Handles the full polling workflow.
 */
export async function searchFoldseek(residues: Residue[]): Promise<FoldseekResult[]> {
    if (residues.length < 3) {
        throw new Error('Please add at least 3 residues to search');
    }

    const { pdbString, isValid, warnings } = exportToPDB(residues);

    if (!isValid) {
        throw new Error('Failed to export structure: ' + warnings.join(', '));
    }

    const formData = new FormData();
    const pdbBlob = new Blob([pdbString], { type: 'text/plain' });
    formData.append('q', pdbBlob, 'query.pdb');
    formData.append('mode', '3diaa');
    formData.append('database[]', 'pdb100');

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

    if (resultData && resultData.result && resultData.result.results) {
        const searchResults: FoldseekResult[] = [];

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
            throw new Error('No similar structures found');
        }

        return searchResults;
    }

    throw new Error('No results returned from search');
}

/**
 * Fetch a PDB structure from RCSB and return centered residues.
 */
export async function fetchPDBStructure(pdbId: string): Promise<Residue[]> {
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

    return centeredResidues;
}
