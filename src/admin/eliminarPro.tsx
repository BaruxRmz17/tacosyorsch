// src/pages/admin/EliminarProducto.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { Trash2 } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
}

const EliminarProducto: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('producto')
        .select('id, nombre, descripcion, precio, categoria');

      if (error) {
        setError('Error al cargar los productos: ' + error.message);
        return;
      }

      // Mapeamos las categorías de la BD a las del formulario
      const productosMapeados = (data || []).map((prod) => ({
        ...prod,
        categoria: prod.categoria === 'General' ? 'Comida' : 'Bebidas', // Mapeo inverso
      }));
      setProductos(productosMapeados);
    };

    fetchProductos();
    window.scrollTo(0, 0); // Esto asegura que la página siempre empiece desde la parte superior
  }, []);

  const handleDelete = async (productoId: number, productoNombre: string) => {
    // Confirmación antes de eliminar
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar "${productoNombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setError('');
    setSuccess('');

    // Eliminar el producto de la tabla 'producto'
    const { error: deleteError } = await supabase
      .from('producto')
      .delete()
      .eq('id', productoId);

    if (deleteError) {
      setError('Error al eliminar el producto: ' + deleteError.message);
      return;
    }

    // Actualizar la lista de productos localmente
    setProductos(productos.filter((p) => p.id !== productoId));
    setSuccess(`Producto "${productoNombre}" eliminado exitosamente.`);
  };

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
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-6 text-center">
          Eliminar Productos
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        {/* Lista de productos */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Productos disponibles</h3>
          {productos.length === 0 ? (
            <p className="text-gray-500 text-center">No hay productos disponibles para eliminar.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productos.map((producto) => (
                <div
                  key={producto.id}
                  className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center transition-all duration-200 hover:bg-red-50"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{producto.nombre}</p>
                    <p className="text-sm text-gray-600">
                      {producto.categoria} - ${producto.precio}
                    </p>
                    {producto.descripcion && (
                      <p className="text-sm text-gray-500 truncate">{producto.descripcion}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(producto.id, producto.nombre)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EliminarProducto;