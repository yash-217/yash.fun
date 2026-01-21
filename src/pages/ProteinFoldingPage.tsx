import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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

                {/* Amino Acid Categories */}
                <div className="categories-section">
                    <h2>Amino Acid Categories</h2>
                    <div className="categories-grid">
                        <div className="category-chip" style={{ backgroundColor: '#9ca3af20', borderColor: '#9ca3af' }}>
                            <span className="category-dot" style={{ backgroundColor: '#9ca3af' }}></span>
                            Simple
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#6b728020', borderColor: '#6b7280' }}>
                            <span className="category-dot" style={{ backgroundColor: '#6b7280' }}></span>
                            Hydrocarbon
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#22c55e20', borderColor: '#22c55e' }}>
                            <span className="category-dot" style={{ backgroundColor: '#22c55e' }}></span>
                            Hydroxyl
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#eab30820', borderColor: '#eab308' }}>
                            <span className="category-dot" style={{ backgroundColor: '#eab308' }}></span>
                            Sulfur
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#ef444420', borderColor: '#ef4444' }}>
                            <span className="category-dot" style={{ backgroundColor: '#ef4444' }}></span>
                            Acidic
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#3b82f620', borderColor: '#3b82f6' }}>
                            <span className="category-dot" style={{ backgroundColor: '#3b82f6' }}></span>
                            Basic
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#a855f720', borderColor: '#a855f7' }}>
                            <span className="category-dot" style={{ backgroundColor: '#a855f7' }}></span>
                            Amide
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#f9731620', borderColor: '#f97316' }}>
                            <span className="category-dot" style={{ backgroundColor: '#f97316' }}></span>
                            Cyclic
                        </div>
                        <div className="category-chip" style={{ backgroundColor: '#ec489920', borderColor: '#ec4899' }}>
                            <span className="category-dot" style={{ backgroundColor: '#ec4899' }}></span>
                            Aromatic
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
