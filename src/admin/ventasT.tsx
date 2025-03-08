// src/pages/admin/VentasTotales.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { DollarSign } from 'lucide-react';

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
  fecha: string; // Nueva columna
  detalle_pedido: {
    id: number;
    cantidad: number;
    producto: {
      id: number;
      nombre: string;
      precio: number;
      categoria: string;
    };
  }[];
}

const VentasTotales: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [totalVentas, setTotalVentas] = useState<number>(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar pedidos completados del día actual al montar el componente
  useEffect(() => {
    const fetchVentas = async () => {
      const { data, error } = await supabase
        .from('pedido')
        .select(`
          id,
          codigo,
          metodo_pago,
          total,
          estado,
          fecha,
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
        .eq('estado', 'Completado')
        .eq('fecha', new Date().toISOString().split('T')[0]) // Filtrar por fecha del día actual
        .order('id', { ascending: false }); // Más recientes primero

      if (error) {
        setError('Error al cargar las ventas: ' + error.message);
        return;
      }

      const pedidosCompletados = data || [];
      setPedidos(pedidosCompletados);

      // Calcular total de ventas del día
      const total = pedidosCompletados.reduce((sum, pedido) => sum + pedido.total, 0);
      setTotalVentas(total);
    };

    fetchVentas();
    window.scrollTo(0, 0); // Esto asegura que la página siempre empiece desde la parte superior
  }, []);

  // Función para cerrar el día
  const handleCerrarDia = async () => {
    const confirmCerrar = window.confirm(
      '¿Estás seguro de cerrar el día? Esto moverá los pedidos completados al historial y reiniciará el total a 0.'
    );

    if (!confirmCerrar) return;

    setError('');
    setSuccess('');

    // 1. Obtener los pedidos completados del día actual
    const { data: pedidosDelDia, error: fetchError } = await supabase
      .from('pedido')
      .select('*')
      .eq('estado', 'Completado')
      .eq('fecha', new Date().toISOString().split('T')[0]);

    if (fetchError) {
      setError('Error al obtener los pedidos del día: ' + fetchError.message);
      return;
    }

    if (pedidosDelDia.length === 0) {
      setSuccess('No hay pedidos completados para cerrar hoy.');
      return;
    }

    // 2. Insertar los pedidos en la tabla historial
    const { error: insertError } = await supabase
      .from('pedido_historial')
      .insert(pedidosDelDia);

    if (insertError) {
      setError('Error al mover los pedidos al historial: ' + insertError.message);
      return;
    }

    // 3. Eliminar los pedidos completados del día actual
    const { error: deleteError } = await supabase
      .from('pedido')
      .delete()
      .eq('estado', 'Completado')
      .eq('fecha', new Date().toISOString().split('T')[0]);

    if (deleteError) {
      setError('Error al eliminar los pedidos del día: ' + deleteError.message);
      return;
    }

    // 4. Reiniciar el estado local
    setPedidos([]);
    setTotalVentas(0);
    setSuccess('Día cerrado exitosamente. Total reiniciado a 0.');
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
          Ventas Totales del Día
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        {/* Total de ventas */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign size={24} /> Total del Día
            </h3>
            <button
              onClick={handleCerrarDia}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Cerrar Día
            </button>
          </div>
          <p className="text-4xl font-bold text-green-600 text-center mt-4">
            ${totalVentas.toFixed(2)}
          </p>
        </div>

        {/* Lista de pedidos completados */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Pedidos Completados ({pedidos.length})
          </h3>
          {pedidos.length === 0 ? (
            <p className="text-gray-500 text-center">No hay ventas completadas hoy aún.</p>
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
                        Pedido #{pedido.codigo} - {pedido.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Método de Pago: {pedido.metodo_pago}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cliente: {pedido.cliente.correo}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      ${pedido.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-gray-700">Productos:</p>
                    <ul className="text-sm text-gray-600">
                      {pedido.detalle_pedido.map((detalle) => (
                        <li key={detalle.id}>
                          {detalle.producto.nombre} (
                          {detalle.producto.categoria === 'General' ? 'Comida' : 'Bebida'}) x
                          {detalle.cantidad}
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

export default VentasTotales;