import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const HeroSection = () => {
 
  const typingAnimation = {
    initial: { width: 0 },
    animate: {
      width: "100%",
      transition: { duration: 2, ease: "ease-out" },
    },
    exit: { width: 0, transition: { duration: 1 } },
  };

  // State to control the animation loop
  const [isTyping, setIsTyping] = useState(true);
 
  useEffect(() => {
    const interval = setInterval(() => {setIsTyping((prev) => !prev);}, 2000);     
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  return (
    <section className="text-center">
      <motion.h1
        className="text-5xl font-extrabold text-gray-900 dark:text-white inline-block overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="block text-ellipsis inline-block"
          variants={typingAnimation}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            borderRight: "4px solid transparent", // This will act as the "cursor"
            animation: isTyping
              ? "typing 2s steps(30) infinite, blink 0.75s step-end infinite"
              : "none", // Toggle cursor blinking when typing
          }}
        >
          Hola, soy Adrián 🚀
        </motion.span>
      </motion.h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
        Estudiante de Ingeniería Informática del software, 20 años. Tercer curso.
      </p>

      {/* Add the CSS animations */}
      <style jsx>{`
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink {
          50% {
            border-color: transparent;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
