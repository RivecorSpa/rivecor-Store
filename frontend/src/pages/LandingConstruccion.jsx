import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  BadgeDollarSign,
} from "lucide-react";

export default function LandingConstruccion() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070A0F] text-white">

      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070A0F] via-[#090d13] to-black" />

      {/* Acceso oculto */}
      <Link
        to="/inicio"
        className="
          absolute
          top-6
          right-6
          z-50
          rounded-full
          border
          border-white/10
          bg-white/5
          px-4
          py-2
          text-xs
          text-white/40
          hover:text-yellow-400
          hover:border-yellow-400
          transition
        "
      >
        Acceso interno
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16">

        <img
          src="/logo.png"
          alt="Rivecor"
          className="h-24 md:h-28 object-contain"
        />

        <img
          src="/construction.png"
          alt="Construcción"
          className="
            mt-10
            w-full
            max-w-3xl
            drop-shadow-[0_0_60px_rgba(250,204,21,.15)]
          "
        />

        <h1 className="mt-10 text-center text-5xl font-black md:text-7xl">
          Estamos en{" "}
          <span className="text-yellow-400">
            Construcción
          </span>
        </h1>

        <p className="mt-6 max-w-3xl text-center text-lg text-white/60 md:text-xl">
          Estamos preparando una nueva experiencia
          para Rivecor Store.

          <br />

          Muy pronto podrás comprar neumáticos,
          llantas y accesorios con despacho a todo Chile.
        </p>

        {/* Barra progreso */}

        <div className="mt-12 w-full max-w-xl">

          <div className="mb-2 flex justify-between text-sm text-white/40">
            <span>Progreso</span>
            <span>75%</span>
          </div>

          <div className="h-4 rounded-full bg-white/10 overflow-hidden">

            <div className="h-full w-[75%] rounded-full bg-yellow-400" />

          </div>

        </div>

        {/* Características */}

        <div className="mt-16 grid w-full max-w-6xl gap-5 md:grid-cols-4">

          <Card
            emoji="🛞"
            title="Grandes marcas"
          />

          <Card
            icon={<ShieldCheck size={30} />}
            title="Garantía"
          />

          <Card
            icon={<Truck size={30} />}
            title="Despachos"
          />

          <Card
            icon={<BadgeDollarSign size={30} />}
            title="Mejores precios"
          />

        </div>

        <p className="mt-16 text-center text-sm text-white/30">
          © {new Date().getFullYear()} Rivecor Store
        </p>

      </div>

    </main>
  );
}

function Card({ title, icon, emoji }) {
  return (
    <div className="
      rounded-3xl
      border
      border-white/10
      bg-white/[0.03]
      p-6
      backdrop-blur
    ">

      <div className="mb-4 flex justify-center text-yellow-400 text-3xl">
        {icon || emoji}
      </div>

      <h3 className="text-center font-bold">
        {title}
      </h3>

    </div>
  );
}