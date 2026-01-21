import { motion } from 'framer-motion';
import type { Project } from '../types/project';
import './ProjectCard.css';

interface ProjectCardProps {
    project: Project;
    index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
    const handleClick = () => {
        if (project.link) {
            window.open(project.link, '_blank');
        }
    };

    return (
        <motion.article
            className="project-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
            whileHover={{ y: -8 }}
            onClick={handleClick}
            style={{
                '--card-color': project.color,
                '--card-gradient': project.gradient,
            } as React.CSSProperties}
        >
            <div className="card-glow" />

            <motion.div
                className="card-emoji"
                whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
            >
                {project.emoji}
            </motion.div>

            <div className="card-content">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">{project.description}</p>

                <div className="card-tags">
                    {project.tags.map((tag) => (
                        <span key={tag} className="card-tag">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <motion.div
                className="card-arrow"
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
            </motion.div>

            {project.featured && (
                <div className="card-featured-badge">Featured</div>
            )}
        </motion.article>
    );
}
