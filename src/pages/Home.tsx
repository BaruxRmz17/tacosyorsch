import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-red-100 text-center p-6">
      <div className="max-w-3xl mx-auto animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-yellow-500 flex items-center justify-center gap-2">
          Bienvenido a Tacos Yorsh 🌮
        </h1>
        <p className="text-lg md:text-xl text-gray-800 mt-6 max-w-lg mx-auto leading-relaxed">
          Los mejores tacos al mejor precio. ¡Pide ya y disfruta del sabor auténtico!
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link 
            to="/menu" 
            className="bg-gradient-to-r from-red-700 to-orange-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
          >
            Ver Menú <ChevronRight size={20} />
          </Link>
          <Link 
            to="/pedido"
            className="bg-gradient-to-r from-yellow-500 to-red-500 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
          >
            Hacer Pedido <ChevronRight size={20} />
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none" />
      <div className="mt-8 text-gray-700 text-sm text-center">
        <p>¡Tacos frescos todo el día!</p>
      </div>
    </div>
  );
};

export default Home;
