// src/pages/admin/Comentarios.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { MessageSquare } from 'lucide-react';

interface Comentario {
  id: number;
  mensaje: string;
  fecha: string;
  cliente: {
    id: number;
    nombre: string;
    correo: string;
  };
}

const Comentarios: React.FC = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Cargar comentarios al montar el componente
  useEffect(() => {
    const fetchComentarios = async () => {
      const { data, error } = await supabase
        .from('comentario')
        .select(`
          id,
          mensaje,
          fecha,
          cliente (
            id,
            nombre,
            correo
          )
        `)
        .order('fecha', { ascending: false }); // Ordenar por fecha descendente

      if (error) {
        setError('Error al cargar los comentarios: ' + error.message);
        return;
      }

      setComentarios(data || []);
    };

    fetchComentarios();
    window.scrollTo(0, 0); // Esto asegura que la página siempre empiece desde la parte superior
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Botón para volver al Home */}
        <button
          onClick={() => navigate('/HomeAdmin')}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>

        <h2 className="text-3xl font-extrabold text-indigo-900 mb-6 text-center flex items-center justify-center gap-2">
          <MessageSquare size={32} /> Comentarios de Clientes
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {comentarios.length === 0 && !error && (
          <p className="text-gray-500 text-center mb-4">No hay comentarios disponibles aún.</p>
        )}

        {/* Lista de comentarios */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Todos los comentarios ({comentarios.length})
          </h3>
          <div className="space-y-6">
            {comentarios.map((comentario) => (
              <div
                key={comentario.id}
                className="p-4 bg-gray-50 rounded-lg shadow-md transition-all duration-200 hover:bg-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-indigo-900">
                    {comentario.cliente.nombre}{' '}
                    <span className="text-sm text-gray-500">
                      ({comentario.cliente.correo})
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(comentario.fecha).toLocaleString('es-MX', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <p className="text-gray-800">{comentario.mensaje}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comentarios;