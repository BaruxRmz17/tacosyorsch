// src/pages/HomeAdmin.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Edit, Trash2, MessageSquare, ShoppingCart, BarChart2, ClipboardList } from 'lucide-react'; // Agregué ClipboardList

const HomeAdmin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-purple-900 text-center mb-12">
          Panel de Administración 
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Opción 1: Subir Producto */}
          <Link
            to="/admin/subirPro"
            className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Coffee size={40} className="mb-4" />
            <span className="text-lg font-semibold">Subir Producto</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Agrega un nuevo producto al menú
            </p>
          </Link>

           {/* Opción 1: Subir Producto */}
           <Link
            to="/admin/guisados"
            className="bg-indigo-600 text-white p-6 rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Coffee size={40} className="mb-4" />
            <span className="text-lg font-semibold">Subir Guisados</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Agrega un nuevo guisado al menú
            </p>
          </Link>

          {/* Opción 2: Editar Producto */}
          <Link
            to="/admin/disgui"
            className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Edit size={40} className="mb-4" />
            <span className="text-lg font-semibold">Editar Disponibilad Guisado</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Modifica disponibilidad del menú
            </p>
          </Link>
          <Link
            to="/admin/editarPro"
            className="bg-green-600 text-white p-6 rounded-xl shadow-lg hover:bg-green-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Edit size={40} className="mb-4" />
            <span className="text-lg font-semibold">Editar Producto</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Modifica producto del menú
            </p>
          </Link>

          {/* Opción 3: Eliminar Producto */}
          <Link
            to="/admin/eliminarPro"
            className="bg-red-600 text-white p-6 rounded-xl shadow-lg hover:bg-red-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <Trash2 size={40} className="mb-4" />
            <span className="text-lg font-semibold">Eliminar Producto</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Borra un producto del menú
            </p>
          </Link>

          {/* Opción 4: Ver Comentarios */}
          <Link
            to="/admin/comentarios"
            className="bg-purple-600 text-white p-6 rounded-xl shadow-lg hover:bg-purple-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <MessageSquare size={40} className="mb-4" />
            <span className="text-lg font-semibold">Ver Comentarios</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Revisa opiniones de clientes
            </p>
          </Link>

          {/* Opción 5: Ver Ventas Totales */}
          <Link
            to="/admin/ventasT"
            className="bg-yellow-600 text-white p-6 rounded-xl shadow-lg hover:bg-yellow-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <BarChart2 size={40} className="mb-4" />
            <span className="text-lg font-semibold">Ver Ventas Totales</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Consulta las ventas totales del negocio
            </p>
          </Link>

          {/* Opción 6: Realizar Pedido */}
          <Link
            to="/admin/pedidoR"
            className="bg-blue-600 text-white p-6 rounded-xl shadow-lg hover:bg-blue-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <ShoppingCart size={40} className="mb-4" />
            <span className="text-lg font-semibold">Realizar Pedido</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Haz un pedido con código de cliente
            </p>
          </Link>

          {/* Nueva Opción: Ver Pedidos */}
          <Link
            to="/admin/verPedidos"
            className="bg-teal-600 text-white p-6 rounded-xl shadow-lg hover:bg-teal-700 hover:scale-105 transform transition-all duration-300 flex flex-col items-center justify-center"
          >
            <ClipboardList size={40} className="mb-4" />
            <span className="text-lg font-semibold">Ver Pedidos</span>
            <p className="text-sm text-center mt-2 opacity-80">
              Consulta el estado de los pedidos
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;