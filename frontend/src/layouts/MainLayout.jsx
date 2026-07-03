import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { Menu, X, ShoppingBag, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

export default function MainLayout() {
  const [open, setOpen] = useState(false);
  const { cartCount } = useCart();

  const closeMenu = () => setOpen(false);

  return (
    <div className="min-h-screen bg-[#070A0F] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-5 py-3">
          <button
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            <Menu size={22} />
          </button>

          <Link
            to="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
          >
            <img
  src="/logo.png"
  alt="Rivecor Store"
  className="h-12 w-auto object-contain sm:h-14 md:h-20"
/>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/70 transition hover:border-yellow-400 hover:text-yellow-400 md:flex"
            >
              <User size={16} />
              Ingresar
            </Link>

            <Link
              to="/carrito"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
            >
              <ShoppingBag size={19} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-black text-black">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-0 z-[70] flex h-screen w-[88%] max-w-[360px] flex-col border-r border-white/10 bg-[#080B10] p-6 shadow-2xl"
            >
              <div className="mb-10 flex items-center justify-between">
                <img
                  src="/logo.png"
                  alt="Rivecor"
                  className="h-14 w-auto object-contain"
                />

                <button
                  onClick={closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  <X size={22} />
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                <MenuLink to="/" label="Inicio" onClick={closeMenu} />
                <MenuLink to="/productos" label="Productos" onClick={closeMenu} />
                <MenuLink to="/login" label="Ingresar" onClick={closeMenu} />
              </nav>

              <div className="mt-auto rounded-[1.5rem] border border-yellow-400/20 bg-yellow-400/10 p-5">
                <p className="text-sm font-black text-yellow-400">
                  Rivecor Store
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Neumáticos, llantas y soluciones para operaciones profesionales.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Outlet />
    </div>
  );
}

function MenuLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-lg font-black text-white/75 transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
    >
      {label}
    </Link>
  );
}