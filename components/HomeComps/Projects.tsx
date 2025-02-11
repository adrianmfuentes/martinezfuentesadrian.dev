import { motion } from "framer-motion";

const Projects = () => (
  <section className="mt-16">
    <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center mb-8">
      🚀 Proyectos Destacados
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
      {[
        { title: "🕹️ Clon de Flappy Bird", desc: "Juego en Three.js", link: "#" },
        { title: "📊 Dashboard con Supabase", desc: "Datos en tiempo real", link: "#" },
        { title: "🤖 Bot de Discord con AI", desc: "Automatización inteligente", link: "#" },
        { title: "🤖 Recuperación de Información", desc: "Procesamiento y evaluación en Python", link: "#" },
        { title: "🤖 Bot de Discord con AI", desc: "Automatización inteligente", link: "#" },
        { title: "🤖 Bot de Discord con AI", desc: "Automatización inteligente", link: "#" }
      ].map((project, index) => (
        <motion.a
          key={index}
          href={project.link}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl block shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1"
          whileHover={{ scale: 1.05 }}
        >
          <h3 className="font-bold text-lg">{project.title}</h3>
          <p className="text-gray-500 dark:text-gray-300">{project.desc}</p>
        </motion.a>
      ))}
    </div>
  </section>
);

export default Projects;
