import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import Fondo from "../GlobalComp/fondo";
import { FaChevronDown } from "react-icons/fa";

const HeroSection = () => {
  const [text, setText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const phrases = useMemo(() => [
    "Hola, soy Adrián Martínez.",
    "Estudio Ingeniería de Software.",
    "Bienvenido a mi web personal.",
  ], []);
  const typingSpeed = 80;
  const deleteSpeed = 50;
  const delayBetweenPhrases = 1000;

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

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((prev) => !prev), 500);
    return () => clearInterval(interval);
  }, []);

  // Función para desplazarse a la siguiente sección
  const scrollToSection = (sectionId: string, offset: number = 100) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const sectionPosition = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: sectionPosition - offset, behavior: "smooth" });
    }
  };  

  return (
    <section 
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
      
      {/* 🔹 Insertamos el fondo animado */}
      <Fondo /> 

      {/* Texto con fondo cuadrado elegante */}
      <motion.h1
        className="relative text-5xl font-extrabold text-white px-6 py-3 bg-teal-600 rounded-lg shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
        <span className="text-white">{cursorVisible ? "|" : " "}</span>
      </motion.h1>

      {/* Flecha para desplazarse */}
      <button
        className="absolute left-1/2 bottom-24 text-4xl text-teal-500 dark:text-teal-300 animate-bounce transform -translate-x-1/2"
        onClick={() => scrollToSection("technologies", 190)}
      >
        <FaChevronDown />
      </button>
    </section>
  );
};

export default HeroSection;
