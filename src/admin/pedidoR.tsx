import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { ShoppingCart, CheckCircle } from 'lucide-react';

interface DetallePedido {
  id: number;
  cantidad: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
  };
}

interface Pedido {
  id: number;
  codigo: string;
  metodo_pago: string;
  total: number;
  estado: string;
  tipo_entrega: 'A domicilio' | 'Pasar a recoger';
  direccion: string | null;
  telefono: string | null;
  cliente: {
    id: number;
    nombre: string;
    correo: string;
  };
  detalle_pedido: DetallePedido[];
}

const PedidoAdmin: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
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
        tipo_entrega,
        direccion,
        telefono,
        cliente (
          id,
          nombre,
          correo
        ),
        detalle_pedido (
          id,
          cantidad,
          comentario,
          producto (
            id,
            nombre,
            precio,
            categoria
          )
        )
      `)
      .eq('codigo', codigo.trim().toUpperCase()) // Normalizamos el código
      .single();

    if (fetchError) {
      console.log('Error completo:', fetchError); // Depuración
      setError('No se encontró un pedido con ese código o hubo un error: ' + fetchError.message);
      return;
    }

    if (!data) {
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
    setSuccess('Pedido encontrado exitosamente.');
    window.scrollTo(0, 0);
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
    window.scrollTo(0, 0);
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

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        {pedido && (
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShoppingCart size={24} /> Detalles del Pedido #{pedido.codigo}
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                <strong>Cliente:</strong> {pedido.cliente.nombre} ({pedido.cliente.correo})
              </p>
              <p className="text-sm text-gray-600">
                <strong>Método de Pago:</strong> {pedido.metodo_pago}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Tipo de Entrega:</strong> {pedido.tipo_entrega}
              </p>
              {pedido.tipo_entrega === 'A domicilio' && (
                <>
                  <p className="text-sm text-gray-600">
                    <strong>Dirección:</strong> {pedido.direccion}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Teléfono:</strong> {pedido.telefono}
                  </p>
                </>
              )}
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong> {pedido.estado}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> ${pedido.total.toFixed(2)}
              </p>
              <div>
                <p className="text-sm font-semibold text-gray-700">Productos:</p>
                <ul className="text-sm text-gray-600 list-disc pl-5">
                  {pedido.detalle_pedido.map((detalle) => (
                    <li key={detalle.id} className="mt-1">
                      {detalle.producto.nombre} ({detalle.producto.categoria}) x
                      {detalle.cantidad} - $
                      {(detalle.producto.precio * detalle.cantidad).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              {pedido.estado === 'Pendiente' && (
                <button
                  onClick={handleFinalize}
                  className="mt-4 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition"
                >
                  <CheckCircle size={20} /> Finalizar Pedido
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidoAdmin;