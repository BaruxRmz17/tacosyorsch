import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500 text-white p-4 shadow-lg sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold tracking-tight hover:text-yellow-300 transition-colors duration-200">Tacos Yosh</Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200">Inicio</Link>
          <Link to="/menu" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200">Menú</Link>
          <Link to="/pedido" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200">Pedidos</Link>
          <Link to="/comentarios" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200">Comentarios</Link>
          <Link to="/LoginAdmin" className="text-lg font-semibold bg-red-600 px-4 py-2 rounded-full hover:bg-red-500 transition-all duration-200">Admin</Link>
        </div>

        <div className="md:hidden">
          <button className="p-2 rounded-full bg-red-700 text-white hover:bg-red-600 transition-all duration-200" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-red-800 mt-4 rounded-lg shadow-lg p-6 flex flex-col items-center space-y-6">
          <Link to="/" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200" onClick={() => setIsOpen(false)}>Inicio</Link>
          <Link to="/menu" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200" onClick={() => setIsOpen(false)}>Menú</Link>
          <Link to="/pedido" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200" onClick={() => setIsOpen(false)}>Pedidos</Link>
          <Link to="/comentarios" className="text-lg font-medium hover:text-yellow-300 transition-all duration-200" onClick={() => setIsOpen(false)}>Comentarios</Link>
          <Link to="/LoginAdmin" className="text-lg font-semibold bg-red-600 px-6 py-2 rounded-full hover:bg-red-500 transition-all duration-200" onClick={() => setIsOpen(false)}>Admin</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
