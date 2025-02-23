"use client";
import { motion } from "framer-motion";

const Fondo = () => {
  return (
    <>
      {/* Capa base: Gradiente animado */}
      <motion.div
        className="absolute inset-0 -z-20 w-full h-full"
        style={{
          background: "linear-gradient(45deg, #0f2027, #203a43, #2c5364)",
          backgroundSize: "600% 600%",
          animation: "gradientShift 20s ease infinite",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Capa overlay: Sutil capa radial en rotación para dinamismo */}
      <motion.div
        className="absolute inset-0 -z-10 w-full h-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 70%)",
          mixBlendMode: "overlay",
          filter: "blur(8px)",
          animation: "rotateAnimation 30s linear infinite",
        }}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 0.7 }}
      />

      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes rotateAnimation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default Fondo;
