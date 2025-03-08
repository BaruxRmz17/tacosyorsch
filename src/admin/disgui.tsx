// src/pages/admin/GestionarGuisados.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { Utensils } from 'lucide-react';

interface Guisado {
  id: number;
  nombre: string;
  descripcion: string | null;
  disponibilidad: 'Disponible' | 'Queda poco' | 'Agotado';
}

const GestionarGuisados: React.FC = () => {
  const [guisados, setGuisados] = useState<Guisado[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuisados = async () => {
      const { data, error } = await supabase
        .from('guisado')
        .select('id, nombre, descripcion, disponibilidad')
        .eq('fecha', new Date().toISOString().split('T')[0])
        .order('nombre', { ascending: true });

      if (error) {
        setError('Error al cargar los guisados: ' + error.message);
        return;
      }

      setGuisados(data || []);
    };

    fetchGuisados();
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateDisponibilidad = async (id: number, nuevaDisponibilidad: 'Disponible' | 'Queda poco' | 'Agotado') => {
    setError('');
    setSuccess('');

    console.log('Enviando actualización:', { id, nuevaDisponibilidad });

    const { error: updateError } = await supabase
      .from('guisado')
      .update({ disponibilidad: nuevaDisponibilidad })
      .eq('id', id);

    if (updateError) {
      setError('Error al actualizar la disponibilidad: ' + updateError.message);
      console.log('Error completo:', updateError);
      return;
    }

    setGuisados(
      guisados.map((guisado) =>
        guisado.id === id ? { ...guisado, disponibilidad: nuevaDisponibilidad } : guisado
      )
    );
    setSuccess('Disponibilidad actualizada exitosamente.');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/HomeAdmin')}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center flex items-center justify-center gap-2">
          <Utensils size={32} /> Gestionar Guisados
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        <div className="bg-white p-6 rounded-xl shadow-xl">
          {guisados.length === 0 ? (
            <p className="text-gray-500 text-center">No hay guisados para hoy.</p>
          ) : (
            <div className="space-y-6">
              {guisados.map((guisado) => (
                <div
                  key={guisado.id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{guisado.nombre}</p>
                      {guisado.descripcion && (
                        <p className="text-sm text-gray-600">{guisado.descripcion}</p>
                      )}
                    </div>
                    <select
                      value={guisado.disponibilidad}
                      onChange={(e) => handleUpdateDisponibilidad(guisado.id, e.target.value as 'Disponible' | 'Queda poco' | 'Agotado')}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Queda poco">Queda poco</option>
                      <option value="Agotado">Agotado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestionarGuisados;
