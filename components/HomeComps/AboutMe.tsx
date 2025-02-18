import { motion } from "framer-motion";
import Image from "next/image";
import "../../css/Components/AboutMe.css";

const AboutMe = () => {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-between min-h-screen px-6 md:px-16 lg:px-32 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white">
      {/* Contenedor de la imagen */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-start mb-6 md:mb-0">
        <motion.div
          className="relative w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 rounded-full overflow-hidden shadow-xl transform hover:scale-105 transition-all duration-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src="/profile.jpg"
            alt="Adrián Martínez"
            layout="fill"
            objectFit="cover"
            className="h-full w-full"
          />
        </motion.div>
      </div>

      {/* Contenedor del texto */}
      <div className="w-full md:w-1/2 text-center md:text-left max-w-3xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold mb-6 text-teal-500"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Sobre Mí
        </motion.h2>

        <motion.p
          className="text-base sm:text-lg leading-relaxed text-gray-200 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Soy <strong>Adrián Martínez</strong>, estudiante de 
          <a 
              href="https://ingenieriainformatica.uniovi.es/"
              className="text-teal-500 hover:text-teal-700 transition-all"
          > Ingeniería del Software Bilingüe</a> en la 
          <a 
            href="https://www.uniovi.es/en/"
            className="text-teal-500 hover:text-teal-700 transition-all"
          > Universidad de Oviedo </a>. 
          Tengo experiencia y conocimientos en el diseño y desarrollo de aplicaciones, lenguajes de programación, ciberseguridad y redes.
        </motion.p>

        <motion.p
          className="text-base sm:text-lg leading-relaxed text-gray-200 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Además, soy una persona activa que disfruta del gimnasio, la natación y la bicicleta. Hablo inglés (B2), francés (B1)
          y estoy aprendiendo alemán. Me encanta viajar y tengo buena capacidad de adaptación. trabajo en equipo y comunicación.
        </motion.p>

        <motion.p
          className="text-base sm:text-lg leading-relaxed text-gray-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Tengo experiencia en <strong>proyectos académicos</strong> desarrollados en equipo, utilizando tecnologías 
          como Java, Pythom, JavaScript, Node.js, MongoDB, Git y Docker, entre otras.
          Además, me especializo en <strong>arquitectura de software</strong> y <strong>optimización del rendimiento</strong>.
        </motion.p>

        <motion.div
          className="mt-8 flex justify-center md:justify-start gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a
            href="/cv.pdf"
            className="px-6 py-3 rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-all"
          >
            Descargar CV
          </a>
          <a
            href="#contact"
            className="px-6 py-3 rounded-md border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white transition-all"
          >
            Contacto
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutMe;
