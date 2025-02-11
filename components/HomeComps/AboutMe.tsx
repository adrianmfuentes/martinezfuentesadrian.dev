import { motion } from "framer-motion";
import Image from "next/image";
import "../../css/Components/AboutMe.css";

const AboutMe = () => {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-16 lg:px-32 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full md:w-1/2 flex justify-center">
        <motion.div
          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src="/profile.jpg"
            alt="Adrián Martínez"
            layout="fill"
            objectFit="cover"
          />
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 text-center md:text-left mt-8 md:mt-0">
        <motion.h2
          className="text-4xl font-bold mb-4 text-teal-600 dark:text-teal-400"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Sobre Mí
        </motion.h2>
        <motion.p
          className="text-lg leading-relaxed max-w-lg mx-auto md:mx-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Soy <span className="font-semibold">Adrián Martínez</span>, estudiante de **Ingeniería del Software** en la Universidad de Oviedo.  
          Apasionado por el desarrollo web, la tecnología y la innovación.  
          Me especializo en **React, Next.js y arquitectura de software**, con un fuerte enfoque en **UX/UI y optimización de rendimiento**.
        </motion.p>

        <motion.div
          className="mt-6 flex justify-center md:justify-start gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a
            href="/cv.pdf"
            className="px-5 py-3 rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-all"
          >
            Descargar CV
          </a>
          <a
            href="#contact"
            className="px-5 py-3 rounded-md border border-teal-600 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition-all"
          >
            Contacto
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMe;
