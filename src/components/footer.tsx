import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500 text-white p-6 mt-10 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
        {/* Sección Izquierda */}
        <div className="flex flex-col items-center md:items-start">
          <Link 
            to="/" 
            className="text-2xl font-extrabold tracking-tight hover:text-yellow-300 transition-colors duration-200"
          >
            🌮 Tacos Yorch
          </Link>
          <p className="text-sm mt-2 opacity-80">
            © {new Date().getFullYear()} Tacos Yorch. Todos los derechos reservados.
          </p>
        </div>

        {/* Sección Derecha */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          {/* Redes Sociales */}
         

          {/* Créditos */}
          <p className="text-sm">
            Creado por{" "}
            <a 
              href="https://ramireztech.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-semibold hover:text-yellow-300 transition-colors duration-200"
            >
              Ramirez Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
