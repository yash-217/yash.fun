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
    },
];

export const featuredProjects = projects.filter(p => p.featured);
