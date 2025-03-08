// src/pages/admin/EditarProducto.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura

interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoria: string;
}

const EditarProducto: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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

  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setPrecio(producto.precio.toString());
    setCategoria(producto.categoria); // Ya mapeado a "Comida" o "Bebidas"
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedProducto) {
      setError('Por favor, selecciona un producto para editar.');
      return;
    }

    if (!nombre || !precio || !categoria) {
      setError('Por favor, completa los campos obligatorios: Nombre, Precio y Categoría.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setError('El precio debe ser un número válido mayor a 0.');
      return;
    }

    // Mapeo de categoría del formulario a la BD
    const categoriaBD = categoria === 'Comida' ? 'General' : 'Bebida';

    const { error: updateError } = await supabase
      .from('producto')
      .update({
        nombre,
        descripcion,
        precio: precioNum,
        categoria: categoriaBD, // Usamos el valor mapeado
      })
      .eq('id', selectedProducto.id);

    if (updateError) {
      setError('Error al actualizar el producto: ' + updateError.message);
      return;
    }

    // Actualizamos la lista local de productos
    setProductos(
      productos.map((p) =>
        p.id === selectedProducto.id
          ? { ...p, nombre, descripcion, precio: precioNum, categoria }
          : p
      )
    );

    setSuccess('Producto actualizado exitosamente.');
    setTimeout(() => {
      setSelectedProducto(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCategoria('');
    }, 2000);
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
          Editar Productos
        </h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Selecciona un producto</h3>
          {error && !selectedProducto && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.length === 0 ? (
              <p className="text-gray-500 text-center col-span-full">No hay productos disponibles.</p>
            ) : (
              productos.map((producto) => (
                <button
                  key={producto.id}
                  onClick={() => handleSelectProducto(producto)}
                  className={`p-4 rounded-lg shadow-md transition-all duration-200 ${
                    selectedProducto?.id === producto.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-indigo-100'
                  }`}
                >
                  <p className="font-semibold">{producto.nombre}</p>
                  <p className="text-sm opacity-80">{producto.categoria} - ${producto.precio}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedProducto && (
          <div className="bg-white p-8 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">
              Editando: {selectedProducto.nombre}
            </h3>
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Nombre del Producto *</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Precio *</label>
                <input
                  type="number"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Categoría *</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Comida">Comida</option>
                  <option value="Bebidas">Bebidas</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditarProducto;