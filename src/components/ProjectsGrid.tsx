import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import { ProjectCard } from './ProjectCard';
import './ProjectsGrid.css';

export function ProjectsGrid() {
    return (
        <section id="projects" className="projects-section">
            <div className="projects-container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="section-label">My Work</span>
                    <h2 className="section-title">
                        Things I've <span className="gradient-text">Built</span>
                    </h2>
                    <p className="section-description">
                        A collection of projects that showcase my skills and passion for creating
                        meaningful digital experiences.
                    </p>
                </motion.div>

                <div className="projects-grid">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>

                <motion.div
                    className="projects-cta"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <p className="projects-cta-text">Want to see more?</p>
                    <motion.a
                        href="https://github.com/yash-217"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="projects-cta-link"
                        whileHover={{ scale: 1.05, x: 5 }}
                    >
                        <span>View all on GitHub</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}

