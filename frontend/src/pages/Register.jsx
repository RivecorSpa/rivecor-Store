import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";

export default function Register() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A0F] px-6 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_30%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl"
      >
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-white/45 hover:text-yellow-400"
        >
          <ArrowLeft size={16} />
          Volver al login
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-400 text-black">
            <User size={30} />
          </div>

          <h1 className="text-4xl font-black">Crear cuenta</h1>

          <p className="mt-3 text-white/45">
            Regístrate para comprar más rápido en Rivecor Store.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Registro simulado. Después conectamos backend.");
          }}
        >
          <Input icon={<User size={18} />} label="Nombre completo" placeholder="Juan Pérez" />
          <Input icon={<Mail size={18} />} label="Correo electrónico" placeholder="correo@ejemplo.cl" />
          <Input icon={<Phone size={18} />} label="Teléfono" placeholder="+56 9 1234 5678" />
          <Input icon={<Lock size={18} />} label="Contraseña" placeholder="••••••••" type="password" />

          <button className="w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300">
            Crear cuenta
          </button>
        </form>
      </motion.div>
    </main>
  );
}

function Input({ icon, label, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-white/55">
        {label}
      </label>

      <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 px-4">
        <span className="text-white/35">{icon}</span>

        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
        />
      </div>
    </div>
  );
}