import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link"; // Usamos Link para los enlaces internos
import "@/styles/Footer.css";
import NavLink from "next/link"; // Import NavLink from next/link

const Footer = () => (
  <footer className="footer">
    <div className="footer-container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
      {/* Información del autor */}
      <div className="footer-author text-center md:text-left mb-6 md:mb-0">
        <h3 className="text-2xl font-semibold">Adrián Martínez Fuentes</h3>
        <p>&copy; 2025 Todos los derechos reservados.</p>
      </div>

      {/* Menú de navegación (todos los items al mismo nivel) */}
      <div className="hidden md:flex space-x-6 text-white">
          <NavLink href="/servicios">Servicios</NavLink>
          <NavLink href="https://martinezfuentesadrian-portfolio.vercel.app/">Portfolio</NavLink>
          <NavLink href="/blog">Blog</NavLink>
          <NavLink href="/contact">Contacto</NavLink>
      </div>

      {/* Iconos de redes sociales */}
      <div className="footer-social flex justify-center md:justify-end space-x-6 text-2xl">
        <Link href="https://github.com/adrianmfuentes" target="_blank" aria-label="GitHub">
          <FaGithub className="hover:text-[#6D9DC5] transition duration-300" />
        </Link>
        <Link href="https://www.linkedin.com/in/adrianmfuentes" target="_blank" aria-label="LinkedIn">
          <FaLinkedin className="hover:text-[#6D9DC5] transition duration-300" />
        </Link>
      </div>
    </div>

    {/* Texto adicional */}
    <div className="footer-bottom text-center mt-6">
      <p>Diseñado y desarrollado con pasión.</p>
    </div>
  </footer>
);

export default Footer;
