// pages/contacto.js

const Contact = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Contáctame</h1>
        <div className="space-y-4">
          <a
            href="mailto:tuemail@example.com"
            className="block w-64 text-center bg-blue-500 text-white py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            📧 Envíame un correo
          </a>
          <a
            href="https://github.com/tuusuario"
            className="block w-64 text-center bg-gray-800 text-white py-2 rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
          >
            💻 Mi perfil de GitHub
          </a>
          <a
            href="https://linkedin.com/in/tuusuario"
            className="block w-64 text-center bg-blue-700 text-white py-2 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
          >
            🔗 Conéctate en LinkedIn
          </a>
          {/* Agrega más enlaces según tus necesidades */}
        </div>
      </div>
    );
  };
  
  export default Contact;
  