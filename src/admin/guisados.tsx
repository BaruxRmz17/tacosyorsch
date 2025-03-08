// src/pages/admin/SubirGuisados.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { Utensils } from 'lucide-react';

const SubirGuisados: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Enviar guisado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre) {
      setError('Por favor, ingresa el nombre del guisado.');
      return;
    }

    // Insertar guisado en la tabla guisado
    const { error: insertError } = await supabase
      .from('guisado')
      .insert({
        nombre,
        descripcion: descripcion || null,
        fecha: new Date().toISOString().split('T')[0], // Fecha actual
      });

    if (insertError) {
      setError('Error al subir el guisado: ' + insertError.message);
      return;
    }

    setSuccess('Guisado subido exitosamente.');
    setNombre('');
    setDescripcion('');
    window.scrollTo(0, 0); // Volver al inicio para mostrar el mensaje
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Botón para volver al Home */}
        <button
          onClick={() => navigate('/HomeAdmin')} // Ruta para admins
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center flex items-center justify-center gap-2">
          <Utensils size={32} /> Subir Guisados
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        {/* Formulario para subir guisado */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
                Nombre del Guisado
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ej. Chicharrón en salsa verde"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="descripcion" className="block text-gray-700 font-medium mb-2">
                Descripción (opcional)
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ej. Guisado picante con chicharrón crujiente"
                rows={4}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              Subir Guisado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubirGuisados;