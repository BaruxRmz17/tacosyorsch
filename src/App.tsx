import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/Home";
import Login from "./pages/LoginAdmin";
import "./index.css";
import PropertyForm from "./admin/subirPro"; //
import EditarPro from "./admin/editarPro";//
import EliminarPro from "./admin/eliminarPro";//
import PedidoAdmin from "./admin/pedidoR";//
import Comentarios from "./admin/comentarios";//
import VerPedidos from "./admin/verPedidos";
import SubirGuisados from "./admin/guisados";
import GestionarGuisados from "./admin/disgui";








import Footer from "./components/footer";
import supabase from "./services/supabase";
import HomeAdmin from "./pages/HomeAdmin";
import Comentario from "./pages/comentarios";
import HacerPedido from "./pages/pedido";
import VerMenu from "./pages/menu";
import VentasTotales from "./admin/ventasT";




const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <div className="pt-4 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/LoginAdmin" element={<LoginRedirect />} />
          <Route path="/admin/subirPro" element={<PropertyForm />} />
          <Route path="/admin/editarPro" element={<EditarPro />} />
          <Route path="/admin/eliminarPro" element={<EliminarPro />} />
          <Route path="/admin/pedidoR" element={<PedidoAdmin />} />
          <Route path="/HomeAdmin" element={<HomeAdmin />} />
          <Route path="/admin/ventasT" element={<VentasTotales />} /> {/* Ruta corregida */}
          <Route path="/admin/comentarios" element={<Comentarios />} />
          <Route path="/admin/verPedidos" element={<VerPedidos />} />
          <Route path="/admin/guisados" element={<SubirGuisados />} />
          <Route path="/admin/disgui" element={<GestionarGuisados />} />



          

          <Route path="/menu" element={<VerMenu />} />
          <Route path="/comentarios" element={<Comentario />} />
          <Route path="/pedido" element={<HacerPedido />} />







        </Routes>
      </div>
      <Footer />
    </Router>
  );
};

const LoginRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate("/HomeAdmin");
      }
    };
    checkUser();
  }, [navigate]);

  return <Login />;
};

export default App;