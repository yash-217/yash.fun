export interface Project {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
    gradient: string;
    link?: string;
    tags: string[];
    featured?: boolean;
}
