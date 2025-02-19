import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import "../../css/footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      {/* Información del autor */}
      <div className="footer-author">
        <h3>Adrián Martínez Fuentes</h3>
        <p>&copy; 2025 Todos los derechos reservados.</p>
      </div>
      {/* Enlaces de navegación */}
      <nav className="footer-nav">
        <a href="/about">Sobre mí</a>
        <a href="/projects">Proyectos</a>
        <a href="/posts">Blog</a>
        <a href="/contact">Contacto</a>
      </nav>
      {/* Iconos de redes sociales */}
      <div className="footer-social">
        <a
          href="https://github.com/adrianmfuentes"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://linkedin.com/in/adrianmfuentes"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          href="https://twitter.com/yourprofile"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
        >
          <FaTwitter />
        </a>
      </div>
    </div>
    <div className="footer-bottom">
      <p>Diseñado y desarrollado con pasión.</p>
    </div>
  </footer>
);

export default Footer;
