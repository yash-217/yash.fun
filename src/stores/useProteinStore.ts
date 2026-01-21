import { create } from 'zustand';

export interface Residue {
    id: string;
    type: string; // Amino acid code (e.g., 'Gly', 'Ala')
    position: [number, number, number];
    rotation: [number, number, number, number]; // Quaternion (x, y, z, w)
    connectedTo: string | null; // ID of the connected residue (C-terminus)
}

interface ProteinStore {
    residues: Residue[];
    selectedId: string | null;

    // Actions
    addResidue: (type: string, position: [number, number, number]) => string;
    updateResidue: (id: string, props: Partial<Omit<Residue, 'id'>>) => void;
    removeResidue: (id: string) => void;
    connectResidues: (idA: string, idB: string) => void;
    selectResidue: (id: string | null) => void;
    clearAll: () => void;
    setResidues: (residues: Residue[]) => void;
}

// Generate unique IDs
let idCounter = 0;
function generateId(): string {
    idCounter++;
    return `residue-${Date.now()}-${idCounter}`;
}

export const useProteinStore = create<ProteinStore>((set) => ({
    residues: [],
    selectedId: null,

    addResidue: (type, position) => {
        const id = generateId();
        const newResidue: Residue = {
            id,
            type,
            position,
            rotation: [0, 0, 0, 1], // Identity quaternion
            connectedTo: null,
        };

        set((state) => ({
            residues: [...state.residues, newResidue],
        }));

        return id;
    },

    updateResidue: (id, props) => {
        set((state) => ({
            residues: state.residues.map((r) =>
                r.id === id ? { ...r, ...props } : r
            ),
        }));
    },

    removeResidue: (id) => {
        set((state) => ({
            residues: state.residues
                .filter((r) => r.id !== id)
                .map((r) => ({
                    ...r,
                    connectedTo: r.connectedTo === id ? null : r.connectedTo,
                })),
            selectedId: state.selectedId === id ? null : state.selectedId,
        }));
    },

    connectResidues: (idA, idB) => {
        set((state) => ({
            residues: state.residues.map((r) =>
                r.id === idA ? { ...r, connectedTo: idB } : r
            ),
        }));
    },

    selectResidue: (id) => {
        set({ selectedId: id });
    },

    clearAll: () => {
        set({ residues: [], selectedId: null });
    },

    setResidues: (residues) => {
        set({ residues, selectedId: null });
    },
}));
