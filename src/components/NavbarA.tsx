import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";
import supabase from '../services/supabase';

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<null | any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    navigate("/");
  };

  const adminMenuItems = [
    { name: "Agregar", action: () => navigate("/admin/agregar") },
    { name: "Editar", action: () => navigate("/admin/editar") },
    { name: "Eliminar", action: () => navigate("/admin/eliminar") },
  ];

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-black p-4 shadow-xl w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="text-white font-extrabold text-3xl tracking-tight hover:text-blue-300 hover:scale-105 cursor-pointer"
          onClick={() => navigate("/admin")}
        >
          ⚙️ Panel de Admin
        </div>

        <div className="hidden md:flex space-x-6 text-gray-200 font-medium">
          {adminMenuItems.map((item) => (
            <button
              key={item.name}
              className="py-1 px-3 transition-all hover:text-white hover:scale-105"
              onClick={item.action}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center">
          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          )}
        </div>

        <button 
          className="md:hidden text-gray-200 hover:text-white hover:scale-110" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-900 text-gray-200 py-6 px-4 shadow-lg">
          {adminMenuItems.map((item) => (
            <button
              key={item.name}
              className="block w-full text-left py-3 px-4 text-lg font-medium hover:bg-blue-900 hover:text-white rounded-md"
              onClick={item.action}
            >
              {item.name}
            </button>
          ))}
          {user && (
            <button
              onClick={handleLogout}
              className="w-full mt-4 bg-red-600 text-white px-5 py-2 rounded-full hover:bg-red-700"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;

