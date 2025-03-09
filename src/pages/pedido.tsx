// src/pages/HacerPedido.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura
import { ShoppingCart, Trash2 } from 'lucide-react';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  comentario: string;
}

interface MetodoPago {
  id: number;
  metodo: string;
  banco: string | null;
  nombre_titular: string | null;
  numero_cuenta: string | null;
}

const HacerPedido: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState<'Transferencia' | 'Efectivo' | ''>('');
  const [metodoPagoInfo, setMetodoPagoInfo] = useState<MetodoPago | null>(null);
  const [nombreCliente, setNombreCliente] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'A domicilio' | 'Pasar a recoger' | ''>('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from('producto')
        .select('id, nombre, precio, categoria')
        .order('categoria', { ascending: true })
        .order('nombre', { ascending: true });

      if (error) {
        setError('Error al cargar los productos: ' + error.message);
        return;
      }

      const productosMapeados = (data || []).map((producto) => ({
        ...producto,
        categoria: producto.categoria === 'General' ? 'Comida' : 'Bebidas',
      }));

      setProductos(productosMapeados);

      const categoriasUnicas = Array.from(
        new Set(productosMapeados.map((p) => p.categoria))
      ).sort();
      setCategorias(['Todas', ...categoriasUnicas]);
    };

    fetchProductos();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMetodoPago = async () => {
      if (metodoPago === 'Transferencia') {
        const { data, error } = await supabase
          .from('metodo_pago')
          .select('id, metodo, banco, nombre_titular, numero_cuenta')
          .eq('metodo', 'Transferencia')
          .single();

        if (error) {
          setError('Error al cargar datos de transferencia: ' + error.message);
          return;
        }
        setMetodoPagoInfo(data || null);
      } else {
        setMetodoPagoInfo(null);
      }
    };

    fetchMetodoPago();
  }, [metodoPago]);

  const productosFiltrados =
    filtroCategoria === 'Todas'
      ? productos
      : productos.filter((producto) => producto.categoria === filtroCategoria);

  const agregarAlCarrito = (producto: Producto) => {
    const existe = carrito.find((item) => item.producto.id === producto.id);
    if (existe) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { producto, cantidad: 1, comentario: '' }]);
    }
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.producto.id !== productoId));
  };

  const cambiarCantidad = (productoId: number, nuevaCantidad: string) => {
    const cantidad = parseInt(nuevaCantidad);
    if (cantidad >= 1) {
      setCarrito(
        carrito.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: cantidad }
            : item
        )
      );
    }
  };

  const cambiarComentario = (productoId: number, comentario: string) => {
    setCarrito(
      carrito.map((item) =>
        item.producto.id === productoId ? { ...item, comentario } : item
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.producto.precio * item.cantidad,
      0
    );
  };

  const generarCodigo = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombreCliente || !correoCliente) {
      setError('Por favor, ingresa el nombre y correo del cliente.');
      return;
    }
    if (!metodoPago) {
      setError('Por favor, selecciona un método de pago.');
      return;
    }
    if (!tipoEntrega) {
      setError('Por favor, selecciona si es a domicilio o pasar a recoger.');
      return;
    }
    if (tipoEntrega === 'A domicilio' && (!direccion || !telefono)) {
      setError('Por favor, ingresa la dirección y el número de teléfono para entrega a domicilio.');
      return;
    }
    if (carrito.length === 0) {
      setError('El carrito está vacío. Agrega productos antes de hacer el pedido.');
      return;
    }

    // 1. Insertar o buscar cliente
    let clienteId: number;
    const { data: clienteExistente, error: clienteError } = await supabase
      .from('cliente')
      .select('id')
      .eq('correo', correoCliente)
      .single();

    if (clienteError && clienteError.code !== 'PGRST116') {
      setError('Error al verificar el cliente: ' + clienteError.message);
      return;
    }

    if (clienteExistente) {
      clienteId = clienteExistente.id;
    } else {
      const { data: nuevoCliente, error: insertError } = await supabase
        .from('cliente')
        .insert({ nombre: nombreCliente, correo: correoCliente })
        .select('id')
        .single();

      if (insertError) {
        setError('Error al crear el cliente: ' + insertError.message);
        return;
      }
      clienteId = nuevoCliente.id;
    }

    // 2. Insertar pedido con tipo de entrega, dirección y teléfono
    const total = calcularTotal();
    const codigo = generarCodigo();
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedido')
      .insert({
        codigo,
        cliente_id: clienteId,
        metodo_pago: metodoPago,
        total,
        estado: 'Pendiente',
        fecha: new Date().toISOString().split('T')[0],
        tipo_entrega: tipoEntrega,
        direccion: tipoEntrega === 'A domicilio' ? direccion : null,
        telefono: tipoEntrega === 'A domicilio' ? telefono : null,
      })
      .select('id')
      .single();

    if (pedidoError) {
      setError('Error al crear el pedido: ' + pedidoError.message);
      return;
    }

    const pedidoId = pedidoData.id;

    // 3. Insertar detalles del pedido
    const detalles = carrito.map((item) => ({
      pedido_id: pedidoId,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      comentario: item.comentario || null,
    }));

    const { error: detalleError } = await supabase
      .from('detalle_pedido')
      .insert(detalles);

    if (detalleError) {
      setError('Error al guardar los detalles del pedido: ' + detalleError.message);
      return;
    }

    // Mostrar mensaje de éxito con el código
    setSuccess(`Pedido realizado con éxito. Tu código es: ${codigo}. ${
      tipoEntrega === 'A domicilio' ? 'Te lo llevaremos pronto.' : 'Pásalo a recoger cuando quieras.'
    }`);
    setCarrito([]);
    setMetodoPago('');
    setTipoEntrega('');
    setDireccion('');
    setTelefono('');
    setNombreCliente('');
    setCorreoCliente('');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-indigo-900 mb-8 text-center">
          Hacer Pedido
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && (
          <div className="mb-8 text-center bg-green-100 p-4 rounded-lg border border-green-300">
            <p className="text-green-700 text-xl md:text-2xl font-bold">{success}</p>
            <p className="text-green-600 text-sm mt-2">
              Guarda este código, lo necesitarás para recoger tu pedido o verificar la entrega.
            </p>
          </div>
        )}

        {/* Lista de productos y carrito */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Productos */}
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Menú</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Filtrar por Categoría
              </label>
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            {productosFiltrados.length === 0 ? (
              <p className="text-gray-500">No hay productos disponibles.</p>
            ) : (
              <div className="space-y-4">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{producto.nombre}</p>
                      <p className="text-sm text-gray-600">
                        {producto.categoria} - ${producto.precio.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Agregar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Carrito y formulario */}
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShoppingCart size={24} /> Carrito
            </h3>
            {carrito.length === 0 ? (
              <p className="text-gray-500">El carrito está vacío.</p>
            ) : (
              <div className="space-y-4">
                {carrito.map((item) => (
                  <div key={item.producto.id} className="flex flex-col p-2 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{item.producto.nombre}</p>
                        <p className="text-sm text-gray-600">
                          ${item.producto.precio.toFixed(2)} x
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => cambiarCantidad(item.producto.id, e.target.value)}
                            min="1"
                            className="w-12 mx-2 p-1 border rounded"
                          />
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(item.producto.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="text-sm text-gray-700">Comentario:</label>
                      <input
                        type="text"
                        value={item.comentario}
                        onChange={(e) => cambiarComentario(item.producto.id, e.target.value)}
                        placeholder="Ej. Sin salsa"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-lg font-bold text-indigo-900 mt-4">
                  Total: ${calcularTotal().toFixed(2)}
                </p>
              </div>
            )}

            {/* Formulario de cliente, entrega y pago */}
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-4">
                <label
                  htmlFor="nombreCliente"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre
                </label>
                <input
                  id="nombreCliente"
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlgliFor="correoCliente"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo
                </label>
                <input
                  id="correoCliente"
                  type="email"
                  value={correoCliente}
                  onChange={(e) => setCorreoCliente(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Entrega
                </label>
                <select
                  value={tipoEntrega}
                  onChange={(e) =>
                    setTipoEntrega(e.target.value as 'A domicilio' | 'Pasar a recoger' | '')
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Seleccionar</option>
                  <option value="A domicilio">A domicilio</option>
                  <option value="Pasar a recoger">Pasar a recoger</option>
                </select>
              </div>

              {/* Campos adicionales para "A domicilio" */}
              {tipoEntrega === 'A domicilio' && (
                <div className="mb-4 space-y-4">
                  <div>
                    <label
                      htmlFor="direccion"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Ej. Calle 123, Colonia Centro"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. 123-456-7890"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={metodoPago}
                  onChange={(e) =>
                    setMetodoPago(e.target.value as 'Transferencia' | 'Efectivo' | '')
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="">Seleccionar</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              {metodoPago === 'Transferencia' && metodoPagoInfo && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-900">
                    Datos para Transferencia:
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Banco:</strong> {metodoPagoInfo.banco}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Nombre del Titular:</strong> {metodoPagoInfo.nombre_titular}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Número de Cuenta:</strong> {metodoPagoInfo.numero_cuenta}
                  </p>
                </div>
              )}

              <div className="text-center text-sm text-yellow-600 mb-4">
                <p>
                  No olvides guardar tu código, lo necesitarás para recoger tu pedido o verificar la entrega.
                </p>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                >
                  Realizar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/menu')}
            className="w-full max-w-xs bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            Regresar al Menú
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs bg-gray-600 text-white p-3 rounded-lg shadow-md hover:bg-gray-700 transition"
          >
            Regresar a Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default HacerPedido;