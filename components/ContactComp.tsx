import { FaGithub, FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";

const ContactSection = () => (
  <section className="mt-20 px-6 lg:px-16 py-12 bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 rounded-xl">
    <motion.h2
      className="text-4xl font-semibold text-center text-gray-800 dark:text-white mb-8"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      🌐 Conéctate Conmigo
    </motion.h2>

    <div className="flex justify-center gap-8 mt-8">
      <motion.a
        href="https://github.com/adrianmfuentes"
        className="text-4xl text-gray-800 dark:text-white p-4 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-110 transition duration-300 ease-in-out"
        whileHover={{ scale: 1.1 }}
      >
        <FaGithub />
      </motion.a>

      <motion.a
        href="https://linkedin.com/in/adrianmfuentes"
        className="text-4xl text-gray-800 dark:text-white p-4 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-110 transition duration-300 ease-in-out"
        whileHover={{ scale: 1.1 }}
      >
        <FaLinkedin />
      </motion.a>
    </div>
  </section>
);

export default ContactSection;
