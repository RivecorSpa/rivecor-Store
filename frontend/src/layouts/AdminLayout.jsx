import { useEffect, useState } from "react";
import AdminNotifications from "../components/AdminNotifications";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LogOut,
  Menu,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
const services = [
  { name: "Railway", status: "online" },
  { name: "API", status: "online" },
  { name: "PostgreSQL", status: "offline" },
  { name: "Getnet", status: "online" },
  { name: "Tienda", status: "online" },
  { name: "WhatsApp", status: "warning" },
];
const statusText = {
  online: "Activo",
  warning: "Advertencia",
  offline: "Sin conexión",
};
const colorMap = {
  online: "bg-green-500",
  warning: "bg-yellow-400",
  offline: "bg-red-500",
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();


const [serviceIndex, setServiceIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setServiceIndex((prev) => (prev + 1) % services.length);
  }, 5000);

  return () => clearInterval(interval);
}, []);
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      className={`min-h-screen bg-[#070A0F] text-white lg:grid ${
        collapsed ? "lg:grid-cols-[96px_1fr]" : "lg:grid-cols-[280px_1fr]"
      }`}
    >
      <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-black/35 px-5 py-6 lg:flex lg:flex-col">
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="transition hover:scale-105"
            title={collapsed ? "Expandir menú" : "Ocultar menú"}
          >
            <img
  src="/logo.png"
  alt="Rivecor"
  className="h-10 sm:h-12 w-auto object-contain"
/>
          </button>
        </div>

        <nav className="space-y-3">
          <AdminLink to="/admin" icon={<BarChart3 size={19} />} label="Dashboard" collapsed={collapsed} />
          <AdminLink to="/admin/catalogo" icon={<Boxes size={19} />} label="Catálogo" collapsed={collapsed} />
          <AdminLink to="/admin/pedidos" icon={<ClipboardList size={19} />} label="Pedidos" collapsed={collapsed} />
          <AdminLink to="/admin/finanzas" icon={<Wallet size={19} />} label="Finanzas" collapsed={collapsed} />
        </nav>

        <div className="mt-auto" />

        <button
          onClick={logout}
          title="Cerrar sesión"
          className={`mt-6 flex items-center rounded-2xl border border-white/10 bg-white/[0.025] text-sm font-bold text-white/50 transition hover:border-red-400 hover:text-red-400 ${
            collapsed ? "justify-center px-0 py-4" : "gap-3 px-5 py-4"
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Cerrar sesión"}
        </button>
      </aside>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70"
        >
          <Menu size={22} />
        </button>

        <img
          src="/logo.png"
          alt="Rivecor"
          className="h-14 w-auto object-contain"
        />

        <button
          onClick={logout}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70"
        >
          <LogOut size={19} />
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 z-[90] flex h-screen w-[88%] max-w-[320px] flex-col border-r border-white/10 bg-[#070A0F] p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <img
                  src="/logo.png"
                  alt="Rivecor"
                  className="h-10 sm:h-12 w-auto object-contain"
                />

                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-3">
                <AdminLink to="/admin" icon={<BarChart3 size={18} />} label="Dashboard" close={() => setMobileOpen(false)} />
                <AdminLink to="/admin/catalogo" icon={<Boxes size={18} />} label="Catálogo" close={() => setMobileOpen(false)} />
                <AdminLink to="/admin/pedidos" icon={<ClipboardList size={18} />} label="Pedidos" close={() => setMobileOpen(false)} />
                <AdminLink to="/admin/finanzas" icon={<Wallet size={18} />} label="Finanzas" close={() => setMobileOpen(false)} />
              </nav>

              <div className="mt-auto" />

              <button
                onClick={logout}
                className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm font-bold text-red-400 transition hover:border-red-400"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0">

  {/* Barra superior */}
  <div className="sticky top-0 z-40 flex items-center justify-end gap-5 border-b border-white/10 bg-[#070A0F]/90 px-6 py-4 backdrop-blur">

  {/* Estado del sistema */}
  <div
  title={`${services[serviceIndex].name} funcionando`}
  className="flex items-center gap-2"
>
  <span
    className={`h-3 w-3 rounded-full animate-pulse ${
  colorMap[services[serviceIndex].status]
}`}
  />

  <span className="text-xs text-white/50">
    {services[serviceIndex].name} · {statusText[services[serviceIndex].status]}
  </span>
</div>

  {/* Notificaciones */}
  <AdminNotifications />

  </div>

  {/* Contenido */}
  <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
    <Outlet />
  </div>

</main>
    </div>
  );
}

function AdminLink({ to, icon, label, close, collapsed = false }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={close}
      title={label}
      className={`flex items-center rounded-2xl border text-sm font-bold transition ${
        collapsed ? "justify-center px-0 py-4" : "gap-3 px-5 py-4"
      } ${
        active
          ? "border-yellow-400/40 bg-yellow-400 text-black"
          : "border-white/10 bg-white/[0.025] text-white/60 hover:border-yellow-400 hover:text-yellow-400"
      }`}
    >
      {icon}
      {!collapsed && label}
    </Link>
  );
}