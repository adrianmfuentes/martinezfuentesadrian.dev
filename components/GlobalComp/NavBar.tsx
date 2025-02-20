import Link from "next/link";
import { useState } from "react";
import "../../css/navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1D3557] fixed top-0 left-0 w-full shadow-lg z-50 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-semibold text-white">
          Adrián Martínez Fuentes
        </Link>

        {/* Menú - Visible en pantallas grandes */}
        <div className="hidden md:flex space-x-6">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/servicios">Servicios</NavLink>
          <NavLink href="/curriculum">Curriculum</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
        </div>

        {/* Botón de acción */}
        <Link href="/login">
          <button className="hidden md:block bg-[#6D9DC5] text-white px-4 py-2 rounded-lg hover:bg-[#4CAF50] transition duration-300 ease-in-out">
            To be continued...
          </button>
        </Link>

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
        <div className="md:hidden bg-white border-t border-gray-200">
          <NavLink href="/">Inicio</NavLink>
          <NavLink href="/servicios">Servicios</NavLink>
          <NavLink href="/curriculum">Curriculum</NavLink>
          <NavLink href="blog">Blog</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
          <Link href="/login">
            <button className="w-full bg-[#6D9DC5] text-white py-2 mt-2 rounded-lg">
              Iniciar Sesión
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children, mobile }: { href: string; children: React.ReactNode; mobile?: boolean }) => {
  return (
    <Link href={href} className={`block text-white hover:text-[#6D9DC5] px-4 py-2 ${mobile ? "border-b border-gray-200" : ""} transition duration-300 ease-in-out`}>
      {children}
    </Link>
  );
};

export default Navbar;
