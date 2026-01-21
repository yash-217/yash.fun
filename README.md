# Protein Builder & Visualization

An interactive 3D web application designed to help users learn about and build protein structures using modern web technologies.

## 🚀 Key Features: Protein Playground

The **Protein Playground** is an interactive 3D environment where users can construct polypeptide chains from scratch.

- **Categorized Peptide Library**: Choose from all 20 standard amino acids, organized by their chemical properties (Simple, Hydrocarbon, Acidic, Basic, etc.).
- **3D Builder Canvas**: Drag and drop amino acids into a 3D space to start building your structure.
- **Intelligent Snapping**: Residues automatically snap to valid peptide bond distances (~3.8Å) when placed near each other.
- **3D Manipulation**: Rotate, zoom, and pan using OrbitControls. Drag individual residues to reposition them after placement.
- **Structure Search (Foldseek Integration)**: Export your custom design to PDB format and search for real-world proteins with similar folds using the Foldseek API.
- **RCSB PDB Loading**: Load real protein structures directly from the Protein Data Bank into the playground for analysis.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **3D Graphics**: [React Three Fiber](https://r3f.docs.pmnd.rs/) (Three.js)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: Tailwind CSS
- **Interactions**: @use-gesture/react
- **APIs**:
  - [Foldseek](https://search.foldseek.com/api/ticket) for structure similarity search
  - [RCSB PDB](https://www.rcsb.org/) for protein structure data

## 📥 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd yash.fun
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📂 Project Structure

- `src/components/projects/protein/`: Core playground components (Canvas, Sidebar, Search).
- `src/stores/useProteinStore.ts`: Centralized state management for the protein builder.
- `src/utils/pdbExporter.ts`: Sanitization and PDB file generation logic.
- `src/data/aminoAcids.ts`: Comprehensive dataset of amino acid properties.

## 🧪 License
Copyright © 2026. All rights reserved.
