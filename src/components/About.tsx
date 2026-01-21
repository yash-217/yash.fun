import { motion } from 'framer-motion';
import './About.css';

const skills = [
    { name: 'React', icon: '⚛️' },
    { name: 'TypeScript', icon: '📘' },
    { name: 'Flutter', icon: '💙' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'Supabase', icon: '⚡' },
    { name: 'GSAP', icon: '🎬' },
];

const stats = [
    { value: '10+', label: 'Projects' },
    { value: '3+', label: 'Years Coding' },
    { value: '∞', label: 'Curiosity' },
];

export function About() {
    return (
        <section id="about" className="about-section">
            <div className="about-container">
                <div className="about-content">
                    <motion.div
                        className="about-text"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="section-label">About Me</span>
                        <h2 className="section-title">
                            Passionate about <span className="gradient-text">code</span> &{' '}
                            <span className="gradient-text">creativity</span>
                        </h2>
                        <p className="about-description">
                            I'm a developer who loves turning complex problems into elegant,
                            user-friendly solutions. My journey started with curiosity and has evolved
                            into a passion for crafting digital experiences that make a difference.
                        </p>
                        <p className="about-description">
                            When I'm not coding, you'll find me reading books, playing video games, or
                            just relaxing.
                        </p>

                        <div className="about-stats">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    className="stat-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <span className="stat-value">{stat.value}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="about-skills"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h3 className="skills-title">Tech I Love</h3>
                        <div className="skills-grid">
                            {skills.map((skill, index) => (
                                <motion.div
                                    key={skill.name}
                                    className="skill-item"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                >
                                    <span className="skill-icon">{skill.icon}</span>
                                    <span className="skill-name">{skill.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
