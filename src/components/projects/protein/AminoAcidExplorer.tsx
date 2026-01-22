import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    AMINO_ACID_CATEGORIES,
    AMINO_ACIDS,
    type AminoAcidCategory,
} from '../../../data/aminoAcids';
import { MiniStructureViewer } from './MiniStructureViewer';

// Amino acid card with 3D preview
function AminoAcidCard({ aminoAcid }: { aminoAcid: typeof AMINO_ACIDS[0] }) {
    return (
        <div className="amino-acid-card">
            {/* 3D Preview */}
            <div className="amino-acid-preview">
                <Canvas
                    camera={{ position: [0, 0, 5], fov: 50 }}
                    style={{ background: 'transparent' }}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 5, 5]} intensity={0.8} />
                    <pointLight position={[-5, -5, 5]} intensity={0.3} color="#6366f1" />
                    <MiniStructureViewer aminoAcidCode={aminoAcid.code} scale={0.4} />
                </Canvas>
            </div>

            {/* Info */}
            <div className="amino-acid-info">
                <div className="amino-acid-header">
                    <span
                        className="amino-acid-symbol"
                        style={{ backgroundColor: aminoAcid.color }}
                    >
                        {aminoAcid.symbol}
                    </span>
                    <div className="amino-acid-names">
                        <span className="amino-acid-name">{aminoAcid.name}</span>
                        <span className="amino-acid-code">{aminoAcid.code}</span>
                    </div>
                </div>
                <p className="amino-acid-description">{aminoAcid.description}</p>
            </div>
        </div>
    );
}

export function AminoAcidExplorer() {
    const categories = Object.keys(AMINO_ACID_CATEGORIES) as AminoAcidCategory[];
    const [selectedCategory, setSelectedCategory] = useState<AminoAcidCategory>('simple');

    const filteredAminoAcids = AMINO_ACIDS.filter(aa => aa.category === selectedCategory);
    const categoryInfo = AMINO_ACID_CATEGORIES[selectedCategory];

    return (
        <div className="amino-acid-explorer">
            {/* Category Tabs */}
            <div className="explorer-categories">
                {categories.map(category => {
                    const info = AMINO_ACID_CATEGORIES[category];
                    const isActive = category === selectedCategory;
                    const count = AMINO_ACIDS.filter(aa => aa.category === category).length;

                    return (
                        <button
                            key={category}
                            className={`category-tab ${isActive ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                            style={{
                                borderColor: isActive ? info.color : 'transparent',
                                backgroundColor: isActive ? `${info.color}15` : 'transparent',
                            }}
                        >
                            <span
                                className="category-dot"
                                style={{ backgroundColor: info.color }}
                            />
                            <span className="category-label">{info.label}</span>
                            <span className="category-count">({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* Category Description */}
            <div className="explorer-header">
                <h3 style={{ color: categoryInfo.color }}>
                    {categoryInfo.label} Amino Acids
                </h3>
                <p>
                    {selectedCategory === 'simple' && 'The simplest building blocks with minimal side chains.'}
                    {selectedCategory === 'hydrocarbon' && 'Hydrophobic amino acids with carbon-hydrogen side chains.'}
                    {selectedCategory === 'hydroxyl' && 'Contain hydroxyl (-OH) groups that can form hydrogen bonds.'}
                    {selectedCategory === 'sulfur' && 'Contain sulfur atoms, enabling disulfide bond formation.'}
                    {selectedCategory === 'acidic' && 'Negatively charged at physiological pH with carboxyl groups.'}
                    {selectedCategory === 'basic' && 'Positively charged at physiological pH with amino groups.'}
                    {selectedCategory === 'amide' && 'Amide derivatives with polar but uncharged side chains.'}
                    {selectedCategory === 'cyclic' && 'Contain ring structures that affect protein backbone flexibility.'}
                    {selectedCategory === 'aromatic' && 'Feature benzene-like rings that absorb UV light.'}
                </p>
            </div>

            {/* Amino Acid Grid */}
            <div className="explorer-grid">
                {filteredAminoAcids.map(aa => (
                    <AminoAcidCard key={aa.code} aminoAcid={aa} />
                ))}
            </div>
        </div>
    );
}
