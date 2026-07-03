import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

// 🔥 PÁGINAS PEDIDO
import PedidoCreado from "./pages/PedidoCreado";
import PedidoTracking from "./pages/PedidoTracking";

// 🔥 LAYOUTS
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// 🔥 PÚBLICO
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PagoResultado from "./pages/PagoResultado";

// 🔐 AUTH
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// 🔒 ADMIN
import AdminDashboard from "./pages/AdminDashboard";
import AdminCatalog from "./pages/AdminCatalog";
import AdminOrders from "./pages/AdminOrders";
import AdminFinance from "./pages/AdminFinance";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* 🌐 RUTAS PÚBLICAS */}
          <Route element={<MainLayout />}>

            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/productos/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pago/resultado" element={<PagoResultado />} />

            {/* 🔥 TRACKING (IMPORTANTE) */}
            <Route path="/pedido/:code" element={<PedidoTracking />} />
            <Route path="/pedido-creado" element={<PedidoCreado />} />

          </Route>

          {/* 🔐 AUTENTICACIÓN */}
          <Route path="/login" element={<Login />} />
          <Route path="/crear-cuenta" element={<Register />} />
          <Route path="/olvide-password" element={<ForgotPassword />} />

          {/* 🔒 ADMIN */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/catalogo" element={<AdminCatalog />} />
            <Route path="/admin/pedidos" element={<AdminOrders />} />
            <Route path="/admin/finanzas" element={<AdminFinance />} />
            
          </Route>

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}