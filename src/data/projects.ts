import type { Project } from '../types/project';

export const projects: Project[] = [
    {
        id: 'fleet-manager',
        title: 'Upasna Borewells Companion',
        description: 'Vehicle fleet management system with service request handling and expense tracking',
        emoji: '🚛',
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        tags: ['React', 'TypeScript', 'Supabase'],
        featured: true,
        link: 'https://app.upasnaborewells.com',
    },
    {
        id: 'protein-viewer',
        title: 'Protein Structure Viewer',
        description: 'Interactive 3D visualization of simple protein structures loaded from PDB with element-based coloring',
        emoji: '🧬',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        tags: ['Three.js', 'PDB', 'WebGL'],
        internalLink: '/protein-folding',
    },
    {
        id: 'tic-tac-toe',
        title: 'Neon Tic-Tac-Toe',
        description: 'Classic strategy game with a futuristic twist. Challenge a friend!',
        emoji: '⭕',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        tags: ['React', 'Game', 'TypeScript'],
        internalLink: '/tic-tac-toe',
    },
    {
        id: 'chess',
        title: 'Neon Chess',
        description: 'Battle the CPU or a friend. Powered by Stockfish 17 engine.',
        emoji: '♟️',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        tags: ['React', 'Stockfish', 'Game'],
        internalLink: '/chess',
    },
];

export const featuredProjects = projects.filter(p => p.featured);

