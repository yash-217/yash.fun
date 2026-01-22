import { Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AminoAcidExplorer } from './projects/protein/AminoAcidExplorer';
import './ProteinFoldingPage.css';

export function ProteinFoldingPage() {
    return (
        <div className="protein-folding-page">
            <Header />
            <main className="protein-main">
                {/* Hero Section */}
                <div className="protein-hero">
                    <span className="protein-emoji">🧬</span>
                    <h1 className="protein-title">
                        Protein <span className="gradient-text">Builder</span>
                    </h1>
                    <p className="protein-subtitle">
                        Create proteins by combining amino acids in 3D.
                        Drag, drop, rotate, and search for similar structures in the PDB.
                    </p>
                    <Link to="/protein-playground" className="cta-button">
                        <span className="cta-icon">🔬</span>
                        Start Building
                        <span className="cta-arrow">→</span>
                    </Link>
                </div>

                {/* Features Section */}
                <div className="features-section">
                    <h2>What You Can Do</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🎯</div>
                            <h3>Drag & Drop</h3>
                            <p>Select from 20 amino acids organized by category and drop them into the 3D space.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔄</div>
                            <h3>3D Manipulation</h3>
                            <p>Rotate, zoom, and pan the view. Move residues and watch them snap into peptide bonds.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔍</div>
                            <h3>Structure Search</h3>
                            <p>Find real proteins similar to your design using Foldseek, then load them from the PDB.</p>
                        </div>
                    </div>
                </div>

                {/* Amino Acid Explorer Section */}
                <div className="categories-section">
                    <h2>Amino Acid Categories</h2>
                    <AminoAcidExplorer />
                </div>
            </main>
            <Footer />
        </div>
    );
}

