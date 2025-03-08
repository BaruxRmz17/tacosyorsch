import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { ShoppingCart, CheckCircle } from 'lucide-react';

const PedidoAdmin: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [pedido, setPedido] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0); // Hace scroll al inicio cuando se carga la página
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPedido(null);

    if (!codigo) {
      setError('Por favor, ingresa un código de pedido.');
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('pedido')
      .select(`
        id,
        codigo,
        metodo_pago,
        total,
        estado,
        cliente (
          id,
          nombre,
          correo
        ),
        detalle_pedido (
          id,
          cantidad,
          producto (
            id,
            nombre,
            precio,
            categoria
          )
        )
      `)
      .eq('codigo', codigo)
      .single();

    if (fetchError || !data) {
      setError('No se encontró un pedido con ese código.');
      return;
    }

    const pedidoMapeado = {
      ...data,
      detalle_pedido: data.detalle_pedido.map((detalle) => ({
        ...detalle,
        producto: {
          ...detalle.producto,
          categoria: detalle.producto.categoria === 'General' ? 'Comida' : 'Bebidas',
        },
      })),
    };

    setPedido(pedidoMapeado);
    window.scrollTo(0, 0); // Hace scroll al inicio al cargar los datos
  };

  const handleFinalize = async () => {
    if (!pedido) return;

    setError('');
    setSuccess('');

    const { error: updateError } = await supabase
      .from('pedido')
      .update({ estado: 'Completado' })
      .eq('id', pedido.id);

    if (updateError) {
      setError('Error al finalizar el pedido: ' + updateError.message);
      return;
    }

    setSuccess('Pedido finalizado exitosamente.');
    setPedido({ ...pedido, estado: 'Completado' });
    window.scrollTo(0, 0); // Hace scroll al inicio tras finalizar el pedido
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/HomeAdmin')}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Volver al Home
        </button>
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-6 text-center">
          Gestionar Pedidos
        </h2>

        <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-full sm:w-2/3">
              <label className="block text-gray-700 font-medium mb-2">
                Ingresa el Código del Pedido
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Ej. ABC123"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 mt-4 sm:mt-0"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PedidoAdmin;
