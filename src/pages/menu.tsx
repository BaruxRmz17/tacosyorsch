// src/pages/VerMenu.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { Utensils } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
}

interface Guisado {
  id: number;
  nombre: string;
  descripcion: string | null;
  disponibilidad: 'Disponible' | 'Queda Poco' | 'Agotado';
}

const VerMenu: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [guisadosDisponibles, setGuisadosDisponibles] = useState<Guisado[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // 1. Obtener todos los guisados de hoy, sin filtrar por disponibilidad inicialmente
      const { data: guisadosData, error: guisadosError } = await supabase
        .from('guisado')
        .select('id, nombre, descripcion, disponibilidad')
        .eq('fecha', new Date().toISOString().split('T')[0])
        .neq('disponibilidad', 'Agotado'); // Excluir solo "Agotado"

      if (guisadosError) {
        setError('Error al cargar los guisados disponibles: ' + guisadosError.message);
        return;
      }

      setGuisadosDisponibles(guisadosData || []);

      // 2. Obtener todos los productos
      const { data: productosData, error: productosError } = await supabase
        .from('producto')
        .select('id, nombre, descripcion, precio, categoria')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (productosError) {
        setError('Error al cargar el menú: ' + productosError.message);
        return;
      }

      const productosMapeados = (productosData || []).map((producto) => ({
        ...producto,
        categoria: producto.categoria === 'General' ? 'Comida' : 'Bebidas',
      }));

      setProductos(productosMapeados);

      const categoriasUnicas = Array.from(
        new Set(productosMapeados.map((p) => p.categoria))
      ).sort();
      setCategorias(['Todas', ...categoriasUnicas]);
    };

    fetchData();
    window.scrollTo(0, 0);

    // Suscripción en tiempo real
    const subscription = supabase
      .channel('guisado-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'guisado',
          filter: `fecha=eq.${new Date().toISOString().split('T')[0]}`,
        },
        (payload) => {
          const updatedGuisado = payload.new as Guisado;
          setGuisadosDisponibles((prev) => {
            // Eliminar si es "Agotado"
            if (updatedGuisado.disponibilidad === 'Agotado') {
              return prev.filter((g) => g.id !== updatedGuisado.id);
            }
            // Actualizar o agregar si es "Disponible" o "Queda Poco"
            const updatedList = prev.filter((g) => g.id !== updatedGuisado.id); // Eliminar el viejo
            updatedList.push(updatedGuisado); // Agregar el actualizado
            return updatedList;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const productosFiltrados =
    filtroCategoria === 'Todas'
      ? productos
      : productos.filter((producto) => producto.categoria === filtroCategoria);

  const productosPorCategoria =
    filtroCategoria === 'Todas'
      ? productosFiltrados.reduce((acc, producto) => {
          if (!acc[producto.categoria]) {
            acc[producto.categoria] = [];
          }
          acc[producto.categoria].push(producto);
          return acc;
        }, {} as Record<string, Producto[]>)
      : { [filtroCategoria]: productosFiltrados };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center flex items-center justify-center gap-2">
          <Utensils size={32} /> Menú y Guisados Disponibles
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {/* Sección de guisados disponibles */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
            Guisados Disponibles Hoy
          </h3>
          {guisadosDisponibles.length === 0 ? (
            <p className="text-gray-500 text-center">
              No hay guisados disponibles para hoy.
            </p>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {guisadosDisponibles.map((guisado) => (
                  <div
                    key={guisado.id}
                    className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col"
                  >
                    <p className="font-semibold text-gray-800">{guisado.nombre}</p>
                    {guisado.descripcion && (
                      <p className="text-sm text-gray-600 mt-1">{guisado.descripcion}</p>
                    )}
                    <p
                      className={`text-sm mt-1 font-medium ${
                        guisado.disponibilidad === 'Disponible'
                          ? 'text-green-600'
                          : guisado.disponibilidad === 'Queda Poco'
                          ? 'text-yellow-600'
                          : 'text-red-600' // Por seguridad, aunque "Agotado" no debería aparecer
                      }`}
                    >
                      {guisado.disponibilidad}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro por categoría para el menú */}
        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2 text-center">
            Filtrar Menú por Categoría
          </label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full max-w-xs mx-auto block p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        {productos.length === 0 && !error && (
          <p className="text-gray-500 text-center mb-4">
            No hay productos en el menú aún.
          </p>
        )}

        {/* Lista de productos por categoría */}
        {Object.keys(productosPorCategoria).length > 0 && (
          <div className="space-y-12">
            {Object.entries(productosPorCategoria).map(([categoria, items]) => (
              <div key={categoria} className="bg-white p-6 rounded-xl shadow-xl">
                <h3 className="text-2xl font-semibold text-indigo-700 mb-4 capitalize">
                  {categoria}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {items.map((producto) => (
                    <div
                      key={producto.id}
                      className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex flex-col"
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-gray-800">{producto.nombre}</p>
                        <p className="text-lg font-bold text-indigo-900">
                          ${producto.precio.toFixed(2)}
                        </p>
                      </div>
                      {producto.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerMenu;