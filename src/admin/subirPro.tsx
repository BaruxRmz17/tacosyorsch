// src/pages/admin/SubirProducto.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura

const SubirProducto: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas
    if (!nombre || !precio || !categoria) {
      setError('Por favor, completa los campos obligatorios: Nombre, Precio y Categoría.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setError('El precio debe ser un número válido mayor a 0.');
      return;
    }

    // Mapeo de categorías del formulario a las permitidas en la BD
    const categoriaBD = categoria === 'Comida' ? 'General' : 'Bebida';

    // Insertar producto en la tabla 'producto'
    const { data, error: insertError } = await supabase
      .from('producto')
      .insert([
        {
          nombre,
          descripcion,
          precio: precioNum,
          categoria: categoriaBD, // Usamos el valor mapeado
        },
      ])
      .select();

    if (insertError) {
      setError('Error al agregar el producto: ' + insertError.message);
      return;
    }

    setSuccess('Producto agregado exitosamente.');
    setTimeout(() => {
      navigate('/HomeAdmin'); // Redirige al panel de admin después de 2 segundos
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-xl">
        {/* Botón para volver al Home */}
        <button
          onClick={() => navigate('/HomeAdmin')}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-6 text-center">
          Subir Nuevo Producto
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Ej. Taco de Suadero"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Ej. Taco con tortilla recién hecha y salsa verde"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Precio *
            </label>
            <input
              type="number"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Ej. 15.00"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Categoría *
            </label>
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
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
          >
            Agregar Producto
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubirProducto;