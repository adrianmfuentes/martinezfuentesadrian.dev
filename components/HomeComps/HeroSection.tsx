import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

const HeroSection = () => {
  const [text, setText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const phrases = useMemo(() => [
    "Hola, soy Adrián Martínez.",
    "Estudio en la Universidad de Oviedo,",
    "Bienvenido a mi web personal.",
  ], []);
  const typingSpeed = 80; // Velocidad de escritura (ms)
  const deleteSpeed = 50; // Velocidad de borrado (ms)
  const delayBetweenPhrases = 1000; // Pausa entre frases

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      setText(phrases[phraseIndex].slice(0, charIndex + 1));

      if (!isDeleting && charIndex === phrases[phraseIndex].length) {
        setTimeout(() => (isDeleting = true), delayBetweenPhrases);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      setTimeout(type, isDeleting ? deleteSpeed : typingSpeed);
    };

    const timeout = setTimeout(type, typingSpeed);
    return () => clearTimeout(timeout);
  }, [phrases]);

  // Cursor intermitente
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 dark:text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
        <span className="text-blue-500">{cursorVisible ? "|" : " "}</span>
      </motion.h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
        Estudiante de Ingeniería Informática del Software bilingüe. 
      </p>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
        Apasionado por el desarrollo y la innovación tecnológica.
      </p>
    </section>
  );
};

export default HeroSection;
