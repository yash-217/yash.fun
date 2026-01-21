import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import './Hero.css';

const roles = [
    'building apps',
    'crafting experiences',
    'solving problems',
    'creating magic',
];

export function Hero() {
    const [roleIndex, setRoleIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRoleIndex((prev) => (prev + 1) % roles.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero">
            <div className="hero-background">
                <div className="hero-gradient-orb hero-gradient-orb-1" />
                <div className="hero-gradient-orb hero-gradient-orb-2" />
                <div className="hero-gradient-orb hero-gradient-orb-3" />
                <div className="hero-grid" />
            </div>

            <div className="hero-content">

                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    Hey, I'm <span className="gradient-text">Yash</span>
                </motion.h1>

                <motion.div
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    I love{' '}
                    <motion.span
                        key={roleIndex}
                        className="hero-role gradient-text"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {roles[roleIndex]}
                    </motion.span>
                </motion.div>

                <motion.p
                    className="hero-description"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    Developer passionate about creating delightful digital experiences. <br />
                    I bring ideas to life with clean code and beautiful interfaces.
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <motion.a
                        href="#projects"
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>View Projects</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </motion.a>
                    <motion.a
                        href="#about"
                        className="btn btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Learn More
                    </motion.a>
                </motion.div>

                <motion.div
                    className="hero-scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1 }}
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
