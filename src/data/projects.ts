import type { Project } from '../types/project';

export const projects: Project[] = [
    {
        id: 'fleet-manager',
        title: 'Upasna Borewells Companion',
        description: 'Vehicle fleet management system with expense tracking and service request handling',
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
        description: 'Interactive 3D visualization of Crambin protein loaded from PDB with element-based coloring',
        emoji: '🧬',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        tags: ['Three.js', 'PDB', 'WebGL'],
        internalLink: '/protein-folding',
    },
];

export const featuredProjects = projects.filter(p => p.featured);

