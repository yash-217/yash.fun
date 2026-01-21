export interface Project {
    id: string;
    title: string;
    description: string;
    emoji: string;
    color: string;
    gradient: string;
    link?: string;
    internalLink?: string;
    tags: string[];
    featured?: boolean;
}
