// src/pages/Comentario.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { MessageSquare } from 'lucide-react';

const Comentario: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Enviar comentario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre || !correo || !mensaje) {
      setError('Por favor, completa todos los campos: nombre, correo y comentario.');
      return;
    }

    // 1. Insertar o buscar cliente
    let clienteId: number;
    const { data: clienteExistente, error: clienteError } = await supabase
      .from('cliente')
      .select('id')
      .eq('correo', correo)
      .single();

    if (clienteError && clienteError.code !== 'PGRST116') { // Código para "no encontrado"
      setError('Error al verificar el cliente: ' + clienteError.message);
      return;
    }

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      const { data: nuevoCliente, error: insertError } = await supabase
        .from('cliente')
        .insert({ nombre, correo })
        .select('id')
        .single();

      if (insertError) {
        setError('Error al crear el cliente: ' + insertError.message);
        return;
      }
      clienteId = nuevoCliente.id;
    }

    // 2. Insertar comentario
    const { error: comentarioError } = await supabase
      .from('comentario')
      .insert({
        cliente_id: clienteId, // Ajustado a tu esquema
        mensaje,
        fecha: new Date().toISOString(), // Fecha actual, aunque tu tabla usa DEFAULT NOW()
      });

    if (comentarioError) {
      setError('Error al enviar el comentario: ' + comentarioError.message);
      return;
    }

    setSuccess('¡Comentario enviado con éxito! Gracias por tu opinión.');
    setNombre('');
    setCorreo('');
    setMensaje('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Botón para volver al Home */}
        <button
          onClick={() => navigate('/')} // Cambia a '/HomeAdmin' si es solo para admins
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center flex items-center justify-center gap-2">
          <MessageSquare size={32} /> Deja tu Comentario
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        {/* Formulario de comentario */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-gray-700 font-medium mb-2">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="correo" className="block text-gray-700 font-medium mb-2">
                Correo
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ej. juan@example.com"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="mensaje" className="block text-gray-700 font-medium mb-2">
                Comentario
              </label>
              <textarea
                id="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Escribe tu comentario aquí..."
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              Enviar Comentario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Comentario;