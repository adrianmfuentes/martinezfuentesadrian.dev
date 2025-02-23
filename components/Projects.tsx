'use client';

import Image from 'next/image';
import "@/styles/Projects.css";
import * as framerMotion from 'framer-motion';
const { motion } = framerMotion;

const projects = [
  { title: "🕹️ Clon de Flappy Bird", desc: "Juego en Three.js", link: "#" },
  { title: "📊 Dashboard con Supabase", desc: "Datos en tiempo real", link: "#" },
  { title: "🤖 Bot de Discord con AI", desc: "Automatización inteligente", link: "#" },
  { title: "📡 Recuperación de Información", desc: "Procesamiento y evaluación en Python", link: "#" },
];

const Projects = () => {
  return (
    <section className="projects-section">
      <motion.h2
        className="projects-title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🚀 Proyectos Destacados
      </motion.h2>

      <div className="projects-grid">
        {projects.map((project, index) => (
          <motion.a
            key={index}
            href={project.link}
            className="project-card"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Image src="/profile.jpg" alt={project.title} width={500} height={300} />
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Projects;
