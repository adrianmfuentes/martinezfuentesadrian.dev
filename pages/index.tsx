import { motion } from "framer-motion";
import Link from "next/link";
import "../css/globals.css";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-10">
      <ThemeToggle />
      
      {/* Hero Section */}
      <section className="text-center">
        <motion.h1
          className="text-4xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Hola, soy Adrián, desarrollador de software y explorador de tecnología
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          Apasionado por la web, el desarrollo y la innovación.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/portfolio" className="btn-primary">Ver Portafolio</Link>
          <Link href="/blog" className="btn-secondary">Leer mi Blog</Link>
          <Link href="/lab" className="btn-secondary">Explorar Lab</Link>
        </div>
      </section>

      {/* Stack Tecnológico */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">🛠️ Tecnologías y Stack</h2>
        <p>React, Next.js, TypeScript, Tailwind, Supabase...</p>
      </section>

      {/* Proyectos Destacados */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">🚀 Proyectos Destacados</h2>
        <ul>
          <li>🕹️ Un clon de Flappy Bird en Three.js</li>
          <li>📊 Dashboard con Next.js y Supabase</li>
          <li>🤖 Un bot de Discord con AI</li>
        </ul>
      </section>

      {/* Últimos Posts */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">📝 Últimos Posts</h2>
        <p>Mostrar últimos posts del blog aquí...</p>
      </section>

      {/* Contacto */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">🌐 Contacto y Redes</h2>
        <p>Encuéntrame en <a href="https://github.com/tuusuario">GitHub</a>, <a href="https://linkedin.com/in/tuusuario">LinkedIn</a>...</p>
      </section>
    </div>
  );
}
