import { motion } from "framer-motion";

const TechnologiesSection = () => (
  <section className="mt-16">
    <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center mb-8">
      🛠️ Tecnologías & Herramientas
    </h2>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
      {["React", "Node.js", "JavaScript", "Python", "Java", "Bases de Datos", "Linux", "Git"]
      .map((tech, index) => (
        <motion.div
          key={index}
          className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg text-center shadow-md"
          whileHover={{ scale: 1.08 }}
        >
          {tech}
        </motion.div>
      ))}
    </div>
  </section>
);

export default TechnologiesSection;
