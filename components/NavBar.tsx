"use client";

import Link from "next/link";
import { useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import "@/styles/NavBar.css"; // Asegúrate de que el CSS esté bien importado

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1D3557] w-full shadow-lg ">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-semibold text-white">
          Adrián Martínez Fuentes
        </Link>

        {/* Menú de navegación (todos los items al mismo nivel) */}
        <div className="hidden md:flex space-x-6 text-white">
          <NavLink href="/servicios">Servicios</NavLink>
          <NavLink href="https://martinezfuentesadrian-portfolio.vercel.app/">Portfolio</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
        </div>

        {/* Iconos de redes sociales */}
        <div className="hidden md:flex space-x-4 text-white text-xl">
          <Link href="https://github.com/adrianmfuentes" target="_blank">
            <FaGithub className="hover:text-[#6D9DC5] transition duration-300" />
          </Link>
          <Link href="https://linkedin.com/in/adri%C3%A1n-mart%C3%ADnez-fuentes-23b79a321" target="_blank">
            <FaLinkedin className="hover:text-[#6D9DC5] transition duration-300" />
          </Link>
        </div>

        {/* Botón de menú en móviles */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Menú desplegable en móviles */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/servicios">Servicios</NavLink>
          <NavLink href="https://martinezfuentesadrian-portfolio.vercel.app/">Portfolio</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
          <div className="flex justify-center space-x-4 mt-4 text-xl text-[#1D3557]">
            <Link href="https://github.com/adrianmfuentes" target="_blank">
              <FaGithub className="hover:text-[#6D9DC5] transition duration-300" />
            </Link>
            <Link href="https://www.linkedin.com/in/adrianmfuentes" target="_blank">
              <FaLinkedin className="hover:text-[#6D9DC5] transition duration-300" />
            </Link>          
          </div>
        </div>
      )}
    </nav>
  );
};

// Componente de enlace personalizado
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link
      href={href}
      className="text-white hover:text-[#6D9DC5] px-4 py-2 transition duration-300 ease-in-out"
    >
      {children}
    </Link>
  );
};

export default Navbar;
