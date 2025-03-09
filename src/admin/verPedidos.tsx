// src/pages/admin/VerPedidos.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { ShoppingCart, Trash2 } from 'lucide-react';

interface DetallePedido {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    categoria: string;
  };
  cantidad: number;
  comentario: string | null;
}

interface Pedido {
  id: number;
  codigo: string;
  cliente: {
    id: number;
    nombre: string;
    correo: string;
  };
  metodo_pago: string;
  total: number;
  estado: string;
  tipo_entrega: 'A domicilio' | 'Pasar a recoger'; // Nuevo campo
  direccion: string | null; // Nuevo campo
  telefono: string | null; // Nuevo campo
  detalle_pedido: DetallePedido[];
}

const VerPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
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
        .eq('estado', 'Pendiente')
        .order('id', { ascending: false });

      if (error) {
        setError('Error al cargar los pedidos: ' + error.message);
        return;
      }

      // Mapear categorías para mostrarlas como "Comida" o "Bebidas"
      const pedidosMapeados = (data || []).map((pedido) => ({
        ...pedido,
        detalle_pedido: pedido.detalle_pedido.map((detalle) => ({
          ...detalle,
          producto: {
            ...detalle.producto,
            categoria: detalle.producto.categoria === 'General' ? 'Comida' : 'Bebidas',
          },
        })),
      }));

      setPedidos(pedidosMapeados);
    };

    fetchPedidos();
    window.scrollTo(0, 0);
  }, []);

  const handleDelete = async (pedidoId: number, pedidoCodigo: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el pedido #${pedidoCodigo}? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setError('');
    setSuccess('');

    const { error: deleteError } = await supabase
      .from('pedido')
      .delete()
      .eq('id', pedidoId);

    if (deleteError) {
      setError('Error al eliminar el pedido: ' + deleteError.message);
      return;
    }

    setPedidos(pedidos.filter((p) => p.id !== pedidoId));
    setSuccess(`Pedido #${pedidoCodigo} eliminado exitosamente.`);
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
        <h2 className="text-3xl font-extrabold text-indigo-900 mb-6 text-center flex items-center justify-center gap-2">
          <ShoppingCart size={32} /> Pedidos en Curso
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        <div className="bg-white p-6 rounded-xl shadow-xl">
          {pedidos.length === 0 ? (
            <p className="text-gray-500 text-center">No hay pedidos en curso.</p>
          ) : (
            <div className="space-y-6">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Pedido #{pedido.codigo}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cliente: {pedido.cliente.nombre} ({pedido.cliente.correo})
                      </p>
                      <p className="text-sm text-gray-600">
                        Método de Pago: {pedido.metodo_pago}
                      </p>
                      <p className="text-sm text-gray-600">
                        Tipo de Entrega: {pedido.tipo_entrega}
                      </p>
                      {pedido.tipo_entrega === 'A domicilio' && (
                        <>
                          <p className="text-sm text-gray-600">
                            Dirección: {pedido.direccion}
                          </p>
                          <p className="text-sm text-gray-600">
                            Teléfono: {pedido.telefono}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-900">
                        ${pedido.total.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleDelete(pedido.id, pedido.codigo)}
                        className="mt-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Productos:</p>
                    <ul className="text-sm text-gray-600">
                      {pedido.detalle_pedido.map((detalle) => (
                        <li key={detalle.id} className="mt-1">
                          {detalle.producto.nombre} ({detalle.producto.categoria}) x
                          {detalle.cantidad} - $
                          {(detalle.producto.precio * detalle.cantidad).toFixed(2)}
                          {detalle.comentario && (
                            <span className="block text-gray-500 italic">
                              Comentario: {detalle.comentario}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
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

export default VerPedidos;