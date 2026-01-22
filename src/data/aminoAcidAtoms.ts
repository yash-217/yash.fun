// Atomic structure data for amino acids
// Positions are relative to the alpha carbon (Cα) at origin
// All positions in Angstroms

export type ElementType = 'C' | 'N' | 'O' | 'H' | 'S';

export interface Atom {
    element: ElementType;
    position: [number, number, number];
    label?: string; // e.g., 'Cα', 'Cβ', 'N', 'O'
}

export interface AtomicBond {
    from: number; // Index in atoms array
    to: number;   // Index in atoms array
}

export interface AminoAcidStructure {
    atoms: Atom[];
    bonds: AtomicBond[];
}

// Element colors (CPK coloring)
export const ELEMENT_COLORS: Record<ElementType, string> = {
    'C': '#909090',  // Carbon - Grey
    'N': '#3050F8',  // Nitrogen - Blue
    'O': '#FF0D0D',  // Oxygen - Red
    'H': '#FFFFFF',  // Hydrogen - White
    'S': '#FFFF30',  // Sulfur - Yellow
};

// Element radii for visualization (scaled down for clarity)
export const ELEMENT_RADII: Record<ElementType, number> = {
    'C': 0.25,
    'N': 0.22,
    'O': 0.20,
    'H': 0.12,
    'S': 0.28,
};

// Backbone atoms common to all amino acids
// N - Cα - C(=O) structure
const backboneAtoms: Atom[] = [
    { element: 'N', position: [-1.2, 0, 0], label: 'N' },
    { element: 'H', position: [-1.7, 0.8, 0], label: 'H' },
    { element: 'C', position: [0, 0, 0], label: 'Cα' },
    { element: 'H', position: [0, 0.9, -0.5], label: 'Hα' },
    { element: 'C', position: [1.2, 0, 0.5], label: 'C' },
    { element: 'O', position: [1.5, -0.8, 1.2], label: 'O' },
    { element: 'O', position: [2.0, 0.8, 0], label: 'O (terminus)' },
];

// Backbone bonds (indices in backboneAtoms)
const backboneBonds: AtomicBond[] = [
    { from: 0, to: 1 },  // N-H
    { from: 0, to: 2 },  // N-Cα
    { from: 2, to: 3 },  // Cα-Hα
    { from: 2, to: 4 },  // Cα-C
    { from: 4, to: 5 },  // C=O
    { from: 4, to: 6 },  // C-O (terminus)
];

// Amino acid side chain structures
// All positions relative to Cα (backbone index 2)
// The Cβ connects to Cα

export const AMINO_ACID_STRUCTURES: Record<string, AminoAcidStructure> = {
    // Glycine - simplest, just H as side chain
    'Gly': {
        atoms: [
            ...backboneAtoms.slice(0, 6), // Skip terminus O for chain
            { element: 'H', position: [0, -0.9, -0.5], label: 'Hα2' }, // Second H on Cα
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 }, // Cα-H (second H)
        ],
    },

    // Alanine - methyl side chain
    'Ala': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.5, -1.8, -0.5], label: 'Hβ1' },
            { element: 'H', position: [0.5, -1.8, -0.5], label: 'Hβ2' },
            { element: 'H', position: [0, -0.8, -1.8], label: 'Hβ3' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },  // Cα-Cβ
            { from: 6, to: 7 },  // Cβ-H
            { from: 6, to: 8 },  // Cβ-H
            { from: 6, to: 9 },  // Cβ-H
        ],
    },

    // Valine - branched hydrocarbon
    'Val': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [0, -0.5, -1.7], label: 'Hβ' },
            { element: 'C', position: [-1.2, -1.8, -0.6], label: 'Cγ1' },
            { element: 'C', position: [1.2, -1.8, -0.6], label: 'Cγ2' },
            { element: 'H', position: [-1.8, -1.5, 0.2], label: 'Hγ1' },
            { element: 'H', position: [-0.9, -2.8, -0.4], label: 'Hγ1' },
            { element: 'H', position: [-1.8, -1.8, -1.4], label: 'Hγ1' },
            { element: 'H', position: [1.8, -1.5, 0.2], label: 'Hγ2' },
            { element: 'H', position: [0.9, -2.8, -0.4], label: 'Hγ2' },
            { element: 'H', position: [1.8, -1.8, -1.4], label: 'Hγ2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 8, to: 10 },
            { from: 8, to: 11 },
            { from: 8, to: 12 },
            { from: 9, to: 13 },
            { from: 9, to: 14 },
            { from: 9, to: 15 },
        ],
    },

    // Leucine - branched
    'Leu': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'H', position: [0, -2.6, 0.7], label: 'Hγ' },
            { element: 'C', position: [-1.2, -3.0, -0.8], label: 'Cδ1' },
            { element: 'C', position: [1.2, -3.0, -0.8], label: 'Cδ2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 9, to: 12 },
        ],
    },

    // Isoleucine
    'Ile': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [0, -0.5, -1.7], label: 'Hβ' },
            { element: 'C', position: [-1.2, -1.8, -0.6], label: 'Cγ1' },
            { element: 'C', position: [1.2, -1.2, -0.3], label: 'Cγ2' },
            { element: 'C', position: [-1.2, -3.2, -0.3], label: 'Cδ1' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 8, to: 10 },
        ],
    },

    // Serine - hydroxyl
    'Ser': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'O', position: [0, -2.2, -0.5], label: 'Oγ' },
            { element: 'H', position: [0, -2.8, -1.2], label: 'Hγ' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
        ],
    },

    // Threonine - hydroxyl
    'Thr': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [0, -0.5, -1.7], label: 'Hβ' },
            { element: 'O', position: [-1.0, -1.8, -0.6], label: 'Oγ1' },
            { element: 'H', position: [-1.7, -1.5, -0.1], label: 'Hγ1' },
            { element: 'C', position: [1.2, -1.8, -0.6], label: 'Cγ2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 8, to: 9 },
            { from: 6, to: 10 },
        ],
    },

    // Cysteine - sulfur
    'Cys': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'S', position: [0, -2.4, -0.3], label: 'Sγ' },
            { element: 'H', position: [0, -3.2, -1.0], label: 'Hγ' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
        ],
    },

    // Methionine - sulfur
    'Met': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'H', position: [-0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'H', position: [0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'S', position: [0, -3.5, -1.5], label: 'Sδ' },
            { element: 'C', position: [0, -5.0, -1.0], label: 'Cε' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 9, to: 12 },
            { from: 12, to: 13 },
        ],
    },

    // Aspartic Acid - acidic
    'Asp': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'O', position: [-0.8, -3.0, -0.8], label: 'Oδ1' },
            { element: 'O', position: [0.8, -2.8, 0.5], label: 'Oδ2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
        ],
    },

    // Glutamic Acid - acidic
    'Glu': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'H', position: [-0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'H', position: [0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'C', position: [0, -3.6, -0.8], label: 'Cδ' },
            { element: 'O', position: [-0.8, -4.3, -0.5], label: 'Oε1' },
            { element: 'O', position: [0.8, -4.0, -1.5], label: 'Oε2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 9, to: 12 },
            { from: 12, to: 13 },
            { from: 12, to: 14 },
        ],
    },

    // Lysine - basic
    'Lys': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'C', position: [0, -3.6, -0.8], label: 'Cδ' },
            { element: 'C', position: [0, -4.9, -0.3], label: 'Cε' },
            { element: 'N', position: [0, -6.2, -0.8], label: 'Nζ' },
            { element: 'H', position: [-0.5, -6.8, -0.3], label: 'Hζ' },
            { element: 'H', position: [0.5, -6.8, -0.3], label: 'Hζ' },
            { element: 'H', position: [0, -6.5, -1.7], label: 'Hζ' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 10, to: 11 },
            { from: 11, to: 12 },
            { from: 12, to: 13 },
            { from: 12, to: 14 },
            { from: 12, to: 15 },
        ],
    },

    // Arginine - basic
    'Arg': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'C', position: [0, -3.6, -0.8], label: 'Cδ' },
            { element: 'N', position: [0, -4.9, -0.3], label: 'Nε' },
            { element: 'H', position: [0, -5.2, 0.6], label: 'Hε' },
            { element: 'C', position: [0, -5.8, -1.2], label: 'Cζ' },
            { element: 'N', position: [-0.8, -6.8, -1.0], label: 'Nη1' },
            { element: 'N', position: [0.8, -5.8, -2.3], label: 'Nη2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 7, to: 8 },
            { from: 8, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 11, to: 12 },
            { from: 11, to: 13 },
        ],
    },

    // Histidine - basic (imidazole ring)
    'His': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'N', position: [-0.8, -3.0, 0.4], label: 'Nδ1' },
            { element: 'C', position: [-0.5, -4.2, 0.8], label: 'Cε1' },
            { element: 'N', position: [0.7, -4.3, 0.3], label: 'Nε2' },
            { element: 'C', position: [1.0, -3.2, -0.4], label: 'Cδ2' },
            { element: 'H', position: [-1.0, -4.9, 1.4], label: 'Hε1' },
            { element: 'H', position: [1.1, -5.1, 0.5], label: 'Hε2' },
            { element: 'H', position: [1.8, -3.0, -0.9], label: 'Hδ2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 10, to: 11 },
            { from: 11, to: 12 },
            { from: 12, to: 13 },
            { from: 13, to: 9 },
            { from: 11, to: 14 },
            { from: 12, to: 15 },
            { from: 13, to: 16 },
        ],
    },

    // Asparagine - amide
    'Asn': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'O', position: [-0.8, -3.0, -0.8], label: 'Oδ1' },
            { element: 'N', position: [0.8, -2.8, 0.5], label: 'Nδ2' },
            { element: 'H', position: [0.6, -3.6, 1.0], label: 'Hδ21' },
            { element: 'H', position: [1.6, -2.4, 0.8], label: 'Hδ22' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 11, to: 12 },
            { from: 11, to: 13 },
        ],
    },

    // Glutamine - amide
    'Gln': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            { element: 'H', position: [-0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'H', position: [0.8, -2.5, 0.3], label: 'Hγ' },
            { element: 'C', position: [0, -3.6, -0.8], label: 'Cδ' },
            { element: 'O', position: [-0.8, -4.3, -0.5], label: 'Oε1' },
            { element: 'N', position: [0.8, -4.0, -1.5], label: 'Nε2' },
            { element: 'H', position: [0.6, -4.8, -2.0], label: 'Hε21' },
            { element: 'H', position: [1.6, -3.6, -1.8], label: 'Hε22' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 9, to: 12 },
            { from: 12, to: 13 },
            { from: 12, to: 14 },
            { from: 14, to: 15 },
            { from: 14, to: 16 },
        ],
    },

    // Proline - cyclic (ring with backbone N)
    'Pro': {
        atoms: [
            { element: 'N', position: [-1.2, 0, 0], label: 'N' },
            { element: 'C', position: [0, 0, 0], label: 'Cα' },
            { element: 'H', position: [0, 0.9, -0.5], label: 'Hα' },
            { element: 'C', position: [1.2, 0, 0.5], label: 'C' },
            { element: 'O', position: [1.5, -0.8, 1.2], label: 'O' },
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.8, -1.4], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.8, -1.4], label: 'Hβ' },
            { element: 'C', position: [-0.5, -2.2, -0.2], label: 'Cγ' },
            { element: 'H', position: [-0.2, -3.0, -0.8], label: 'Hγ' },
            { element: 'H', position: [-0.2, -2.4, 0.8], label: 'Hγ' },
            { element: 'C', position: [-2.0, -1.8, -0.1], label: 'Cδ' },
            { element: 'H', position: [-2.5, -2.3, -0.9], label: 'Hδ' },
            { element: 'H', position: [-2.5, -2.0, 0.8], label: 'Hδ' },
        ],
        bonds: [
            { from: 0, to: 1 },   // N-Cα
            { from: 1, to: 2 },   // Cα-Hα
            { from: 1, to: 3 },   // Cα-C
            { from: 3, to: 4 },   // C=O
            { from: 1, to: 5 },   // Cα-Cβ
            { from: 5, to: 6 },
            { from: 5, to: 7 },
            { from: 5, to: 8 },   // Cβ-Cγ
            { from: 8, to: 9 },
            { from: 8, to: 10 },
            { from: 8, to: 11 },  // Cγ-Cδ
            { from: 11, to: 12 },
            { from: 11, to: 13 },
            { from: 11, to: 0 },  // Cδ-N (ring closure)
        ],
    },

    // Phenylalanine - aromatic benzene ring
    'Phe': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            // Benzene ring
            { element: 'C', position: [-1.2, -2.9, -0.3], label: 'Cδ1' },
            { element: 'C', position: [1.2, -2.9, -0.3], label: 'Cδ2' },
            { element: 'C', position: [-1.2, -4.3, -0.3], label: 'Cε1' },
            { element: 'C', position: [1.2, -4.3, -0.3], label: 'Cε2' },
            { element: 'C', position: [0, -5.0, -0.3], label: 'Cζ' },
            { element: 'H', position: [-2.1, -2.4, -0.3], label: 'Hδ1' },
            { element: 'H', position: [2.1, -2.4, -0.3], label: 'Hδ2' },
            { element: 'H', position: [-2.1, -4.8, -0.3], label: 'Hε1' },
            { element: 'H', position: [2.1, -4.8, -0.3], label: 'Hε2' },
            { element: 'H', position: [0, -6.0, -0.3], label: 'Hζ' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            // Ring
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 10, to: 12 },
            { from: 11, to: 13 },
            { from: 12, to: 14 },
            { from: 13, to: 14 },
            // Ring hydrogens
            { from: 10, to: 15 },
            { from: 11, to: 16 },
            { from: 12, to: 17 },
            { from: 13, to: 18 },
            { from: 14, to: 19 },
        ],
    },

    // Tyrosine - aromatic with hydroxyl
    'Tyr': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            // Benzene ring
            { element: 'C', position: [-1.2, -2.9, -0.3], label: 'Cδ1' },
            { element: 'C', position: [1.2, -2.9, -0.3], label: 'Cδ2' },
            { element: 'C', position: [-1.2, -4.3, -0.3], label: 'Cε1' },
            { element: 'C', position: [1.2, -4.3, -0.3], label: 'Cε2' },
            { element: 'C', position: [0, -5.0, -0.3], label: 'Cζ' },
            { element: 'O', position: [0, -6.3, -0.3], label: 'Oη' },
            { element: 'H', position: [0, -6.9, -1.0], label: 'Hη' },
            { element: 'H', position: [-2.1, -2.4, -0.3], label: 'Hδ1' },
            { element: 'H', position: [2.1, -2.4, -0.3], label: 'Hδ2' },
            { element: 'H', position: [-2.1, -4.8, -0.3], label: 'Hε1' },
            { element: 'H', position: [2.1, -4.8, -0.3], label: 'Hε2' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            // Ring
            { from: 9, to: 10 },
            { from: 9, to: 11 },
            { from: 10, to: 12 },
            { from: 11, to: 13 },
            { from: 12, to: 14 },
            { from: 13, to: 14 },
            // Hydroxyl
            { from: 14, to: 15 },
            { from: 15, to: 16 },
            // Ring hydrogens
            { from: 10, to: 17 },
            { from: 11, to: 18 },
            { from: 12, to: 19 },
            { from: 13, to: 20 },
        ],
    },

    // Tryptophan - aromatic indole ring
    'Trp': {
        atoms: [
            ...backboneAtoms.slice(0, 6),
            { element: 'C', position: [0, -1.0, -0.8], label: 'Cβ' },
            { element: 'H', position: [-0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'H', position: [0.8, -0.7, -1.3], label: 'Hβ' },
            { element: 'C', position: [0, -2.3, -0.3], label: 'Cγ' },
            // Five-membered ring
            { element: 'C', position: [-0.8, -3.2, 0.3], label: 'Cδ1' },
            { element: 'N', position: [-0.3, -4.4, 0.5], label: 'Nε1' },
            { element: 'H', position: [-0.8, -5.2, 0.8], label: 'Hε1' },
            // Six-membered ring (fused)
            { element: 'C', position: [1.0, -4.3, 0.1], label: 'Cε2' },
            { element: 'C', position: [1.2, -3.0, -0.3], label: 'Cδ2' },
            { element: 'C', position: [2.0, -5.2, 0.1], label: 'Cζ2' },
            { element: 'C', position: [3.2, -4.7, -0.3], label: 'Cη2' },
            { element: 'C', position: [3.4, -3.4, -0.7], label: 'Cζ3' },
            { element: 'C', position: [2.4, -2.5, -0.7], label: 'Cε3' },
            // Hydrogens
            { element: 'H', position: [-1.7, -3.0, 0.6], label: 'Hδ1' },
            { element: 'H', position: [1.9, -6.2, 0.4], label: 'Hζ2' },
            { element: 'H', position: [4.0, -5.4, -0.3], label: 'Hη2' },
            { element: 'H', position: [4.3, -3.0, -1.0], label: 'Hζ3' },
            { element: 'H', position: [2.5, -1.5, -1.0], label: 'Hε3' },
        ],
        bonds: [
            ...backboneBonds.slice(0, 5),
            { from: 2, to: 6 },
            { from: 6, to: 7 },
            { from: 6, to: 8 },
            { from: 6, to: 9 },
            // Five-membered ring
            { from: 9, to: 10 },
            { from: 10, to: 11 },
            { from: 11, to: 12 },
            { from: 11, to: 13 },
            { from: 13, to: 14 },
            { from: 9, to: 14 },
            // Six-membered ring
            { from: 14, to: 15 },
            { from: 15, to: 16 },
            { from: 16, to: 17 },
            { from: 17, to: 18 },
            { from: 18, to: 14 },
            // Hydrogens
            { from: 10, to: 19 },
            { from: 15, to: 20 },
            { from: 16, to: 21 },
            { from: 17, to: 22 },
            { from: 18, to: 23 },
        ],
    },
};

// Helper to get structure for amino acid code
export function getAminoAcidStructure(code: string): AminoAcidStructure | null {
    return AMINO_ACID_STRUCTURES[code] ?? null;
}
