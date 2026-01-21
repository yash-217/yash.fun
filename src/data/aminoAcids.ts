// Amino Acid Categories
export type AminoAcidCategory =
    | 'simple'
    | 'hydrocarbon'
    | 'hydroxyl'
    | 'sulfur'
    | 'acidic'
    | 'basic'
    | 'amide'
    | 'cyclic'
    | 'aromatic';

export interface AminoAcid {
    name: string;
    code: string; // 3-letter code
    symbol: string; // 1-letter code
    category: AminoAcidCategory;
    description: string;
    color: string; // Hex color for visualization
}

export const AMINO_ACID_CATEGORIES: Record<AminoAcidCategory, { label: string; color: string }> = {
    simple: { label: 'Simple', color: '#9ca3af' },
    hydrocarbon: { label: 'Hydrocarbon', color: '#6b7280' },
    hydroxyl: { label: 'Hydroxyl', color: '#22c55e' },
    sulfur: { label: 'Sulfur', color: '#eab308' },
    acidic: { label: 'Acidic', color: '#ef4444' },
    basic: { label: 'Basic', color: '#3b82f6' },
    amide: { label: 'Amide', color: '#a855f7' },
    cyclic: { label: 'Cyclic', color: '#f97316' },
    aromatic: { label: 'Aromatic', color: '#ec4899' },
};

export const AMINO_ACIDS: AminoAcid[] = [
    // Simple
    {
        name: 'Glycine',
        code: 'Gly',
        symbol: 'G',
        category: 'simple',
        description: 'Simplest amino acid with just hydrogen as side chain',
        color: '#9ca3af',
    },
    // Hydrocarbon (Aliphatic)
    {
        name: 'Alanine',
        code: 'Ala',
        symbol: 'A',
        category: 'hydrocarbon',
        description: 'Small, hydrophobic with methyl side chain',
        color: '#6b7280',
    },
    {
        name: 'Valine',
        code: 'Val',
        symbol: 'V',
        category: 'hydrocarbon',
        description: 'Branched-chain, highly hydrophobic',
        color: '#6b7280',
    },
    {
        name: 'Leucine',
        code: 'Leu',
        symbol: 'L',
        category: 'hydrocarbon',
        description: 'Branched-chain, essential amino acid',
        color: '#6b7280',
    },
    {
        name: 'Isoleucine',
        code: 'Ile',
        symbol: 'I',
        category: 'hydrocarbon',
        description: 'Branched-chain, isomer of leucine',
        color: '#6b7280',
    },
    // Hydroxyl
    {
        name: 'Serine',
        code: 'Ser',
        symbol: 'S',
        category: 'hydroxyl',
        description: 'Contains hydroxyl group, often phosphorylated',
        color: '#22c55e',
    },
    {
        name: 'Threonine',
        code: 'Thr',
        symbol: 'T',
        category: 'hydroxyl',
        description: 'Contains hydroxyl group, essential amino acid',
        color: '#22c55e',
    },
    // Sulfur
    {
        name: 'Cysteine',
        code: 'Cys',
        symbol: 'C',
        category: 'sulfur',
        description: 'Contains thiol group, forms disulfide bonds',
        color: '#eab308',
    },
    {
        name: 'Methionine',
        code: 'Met',
        symbol: 'M',
        category: 'sulfur',
        description: 'Contains thioether, start codon amino acid',
        color: '#eab308',
    },
    // Acidic
    {
        name: 'Aspartic Acid',
        code: 'Asp',
        symbol: 'D',
        category: 'acidic',
        description: 'Negatively charged, carboxylic acid side chain',
        color: '#ef4444',
    },
    {
        name: 'Glutamic Acid',
        code: 'Glu',
        symbol: 'E',
        category: 'acidic',
        description: 'Negatively charged, neurotransmitter precursor',
        color: '#ef4444',
    },
    // Basic
    {
        name: 'Lysine',
        code: 'Lys',
        symbol: 'K',
        category: 'basic',
        description: 'Positively charged, essential amino acid',
        color: '#3b82f6',
    },
    {
        name: 'Arginine',
        code: 'Arg',
        symbol: 'R',
        category: 'basic',
        description: 'Positively charged, contains guanidinium group',
        color: '#3b82f6',
    },
    {
        name: 'Histidine',
        code: 'His',
        symbol: 'H',
        category: 'basic',
        description: 'Positively charged at low pH, imidazole ring',
        color: '#3b82f6',
    },
    // Amide
    {
        name: 'Asparagine',
        code: 'Asn',
        symbol: 'N',
        category: 'amide',
        description: 'Amide derivative of aspartic acid',
        color: '#a855f7',
    },
    {
        name: 'Glutamine',
        code: 'Gln',
        symbol: 'Q',
        category: 'amide',
        description: 'Amide derivative of glutamic acid',
        color: '#a855f7',
    },
    // Cyclic
    {
        name: 'Proline',
        code: 'Pro',
        symbol: 'P',
        category: 'cyclic',
        description: 'Cyclic structure, introduces kinks in proteins',
        color: '#f97316',
    },
    // Aromatic
    {
        name: 'Phenylalanine',
        code: 'Phe',
        symbol: 'F',
        category: 'aromatic',
        description: 'Aromatic ring, essential amino acid',
        color: '#ec4899',
    },
    {
        name: 'Tyrosine',
        code: 'Tyr',
        symbol: 'Y',
        category: 'aromatic',
        description: 'Aromatic with hydroxyl, often phosphorylated',
        color: '#ec4899',
    },
    {
        name: 'Tryptophan',
        code: 'Trp',
        symbol: 'W',
        category: 'aromatic',
        description: 'Largest amino acid, indole ring system',
        color: '#ec4899',
    },
];

// Group amino acids by category
export function getAminoAcidsByCategory(): Record<AminoAcidCategory, AminoAcid[]> {
    const grouped = {} as Record<AminoAcidCategory, AminoAcid[]>;

    for (const category of Object.keys(AMINO_ACID_CATEGORIES) as AminoAcidCategory[]) {
        grouped[category] = AMINO_ACIDS.filter(aa => aa.category === category);
    }

    return grouped;
}
