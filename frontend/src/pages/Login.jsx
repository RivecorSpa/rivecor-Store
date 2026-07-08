import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://rivecor-store-production.up.railway.app/api";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales inválidas");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070A0F] px-6 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.15),transparent_35%)]" />

      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2.3rem] border border-white/10 bg-white/[0.045] p-8 shadow-2xl backdrop-blur-xl"
      >
        
        <Link
  to="/"
  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white/55 transition hover:border-yellow-400 hover:text-yellow-400"
>
  <ArrowLeft size={18} />
  Volver al inicio
</Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="Rivecor Store"
              className="h-28 w-auto object-contain"
            />
          </div>

          <h1 className="text-4xl font-black">
            RIVECOR<span className="text-yellow-400"> STORE</span>
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45">
            Accede a tu cuenta para revisar pedidos, gestionar compras y
            continuar tu experiencia en Rivecor Store.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm font-bold text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-white/55">
              Correo electrónico
            </label>

            <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-yellow-400/60">
              <Mail size={18} className="text-white/35" />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.cl"
                className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-white/55">
              Contraseña
            </label>

            <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-yellow-400/60">
              <Lock size={18} className="text-white/35" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/35 transition hover:text-yellow-400"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-white/45">
              <input type="checkbox" className="accent-yellow-400" />
              Recordarme
            </label>

            <Link
              to="/olvide-password"
              className="font-bold text-yellow-400 transition hover:text-yellow-300"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/45">
            ¿No tienes cuenta?
          </p>

          <Link
            to="/crear-cuenta"
            className="mt-3 inline-block font-black text-yellow-400 transition hover:text-yellow-300"
          >
            Crear cuenta
          </Link>
        </div>
      </motion.div>
    </main>
  );
}