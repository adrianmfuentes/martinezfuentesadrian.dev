'use client';

import { FaGithub, FaLinkedin } from "react-icons/fa";
import * as framerMotion from 'framer-motion';
const { motion } = framerMotion;
import "@/styles/Contact.css";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Lógica para enviar el formulario
    console.log("Formulario enviado");
  };

  return (
    <section className="contact-section">
      <motion.h2
        className="contact-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        Conéctate Conmigo
      </motion.h2>

      <div className="contact-container">
        {/* Formulario de Contacto */}
        <motion.form
          onSubmit={handleSubmit}
          className="contact-form"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="Tu nombre"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              placeholder="tuemail@ejemplo.com"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Mensaje
            </label>
            <textarea
              id="message"
              required
              rows={5}
              placeholder="Escribe tu mensaje..."
              className="form-textarea"
            />
          </div>
          <motion.button
            type="submit"
            className="form-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enviar Mensaje
          </motion.button>
        </motion.form>

        {/* Sección de Redes Sociales */}
        <motion.div
          className="social-container"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <p className="social-text">O también encuéntrame en:</p>
          <div className="social-links">
            <motion.a
              href="https://github.com/adrianmfuentes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="social-link"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <FaGithub />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/adrianmfuentes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-link"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <FaLinkedin />
            </motion.a>
          </div>
          <p className="social-footer">
            Estoy atento a tus mensajes y consultas.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
