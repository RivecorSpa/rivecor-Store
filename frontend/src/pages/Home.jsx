
import { Link } from "react-router-dom";
import TireFinder from "../components/TireFinder";
import { useState, useEffect } from "react";
import { BadgeDollarSign } from "lucide-react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

const brands = [
  { name: "CONTINENTAL", category: "TRANSPORTE" },
  { name: "PIRELLI", category: "FLOTAS" },
  { name: "FIRESTONE", category: "INDUSTRIAL" },
  { name: "DUNLOP", category: "FAENAS" },
  { name: "HANKOOK", category: "LOGÍSTICA" },
  { name: "MICHELIN", category: "CAMIONES" },
  { name: "BFGOODRICH", category: "4X4" },
  { name: "TOYO", category: "SUV" },
  { name: "YOKOHAMA", category: "DEPORTIVOS" },
  { name: "COOPER", category: "OFFROAD" },
];

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);

useEffect(() => {
  setShowLanding(true);
}, []);
if (showLanding) {
  return (
    <main className="fixed inset-0 z-[9999] overflow-y-auto bg-[#070A0F] text-white">
      {/* BOTÓN SECRETO */}
<div
  onClick={() => setShowLanding(false)}
  title="Acceso interno"
  className="
    fixed
    top-0
    right-0
    w-28
    h-28
    z-[99999]
    cursor-pointer
    opacity-0
  "
/>
  

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-16 text-center">

        {/* LOGO (DOBLE CLICK PARA ENTRAR) */}
        <img
          src="/logo.png"
          alt="Rivecor Store"
          className="mb-10 h-24 cursor-pointer object-contain transition hover:scale-105"
          
        />

        {/* IMAGEN */}
        <img
          src="/construction.png"
          alt="Construcción"
          className="w-full max-w-3xl rounded-[32px] border border-white/10 shadow-2xl"
        />

        {/* TITULO */}
        <h1 className="mt-12 text-5xl font-black leading-tight md:text-7xl">
          Estamos en{" "}
          <span className="text-yellow-400">
            Construcción
          </span>
        </h1>

        {/* TEXTO */}
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/60">
          Estamos desarrollando la nueva plataforma digital de{" "}
          <span className="font-bold text-yellow-400">
            Rivecor Store
          </span>
          .
          <br />
          Muy pronto podrás acceder a nuestro catálogo completo de
          neumáticos, llantas y servicios para vehículos livianos,
          camionetas, SUV, camiones y maquinaria pesada.
        </p>

        {/* BARRA */}
        <div className="mt-12 w-full max-w-2xl">

          <div className="mb-2 flex justify-between text-sm text-white/40">
            <span>Próximamente</span>
            <span>2026</span>
          </div>

          <div className="h-4 overflow-hidden rounded-full bg-white/10">

            <div className="h-full w-[75%] rounded-full bg-yellow-400 animate-pulse" />

          </div>

        </div>

        {/* BENEFICIOS */}
        <div className="mt-16 grid w-full max-w-6xl gap-6 md:grid-cols-4">

          <Benefit
            icon={<Search />}
            title="Búsqueda Inteligente"
            text="Encuentra rápidamente el neumático ideal."
          />

          <Benefit
            icon={<ShieldCheck />}
            title="Compra Segura"
            text="Pagos protegidos mediante Getnet."
          />

          <Benefit
            icon={<Truck />}
            title="Despachos"
            text="Cobertura para todo Chile."
          />

          <Benefit
            icon={<BadgeDollarSign />}
            title="Mejores Precios"
            text="Grandes marcas al mejor valor."
          />

        </div>

        {/* TEXTO OCULTO */}
        

      </div>

    </main>
  );
}
  return (
    <main>
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-400">
              Neumáticos, llantas y servicios
            </span>

            <h1 className="mt-8 max-w-3xl text-5xl font-black leading-tight md:text-7xl">
              Encuentra el neumático ideal para tu vehículo.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Compra de forma rápida, filtra por aro o medida,
              revisa stock disponible y agenda instalación profesional.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/productos"
                className="rounded-full bg-yellow-400 px-8 py-4 text-center font-black text-black transition hover:bg-yellow-300"
              >
                Ver productos
              </Link>

              <a
                href="#beneficios"
                className="rounded-full border border-white/15 px-8 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Ver beneficios
              </a>
            </div>
          </motion.div>

          <motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.7 }}
>
  <TireFinder />
</motion.div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-white/10 bg-black/30 py-5">
        <div className="brands-track">
          {[...brands, ...brands].map((brand, index) => (
            <div
              key={index}
              className="flex min-w-[280px] items-center justify-between px-8"
            >
              <div className="flex items-center gap-3">
                <span className="text-yellow-400">⬢</span>

                <span className="font-black tracking-[4px] text-yellow-400">
                  {brand.name}
                </span>
              </div>

              <span className="text-xs uppercase tracking-[3px] text-white/30">
                {brand.category}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        id="beneficios"
        className="mx-auto max-w-7xl px-6 py-24"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <Benefit
            icon={<Search />}
            title="Búsqueda rápida"
            text="Filtra por aro, medida o categoría."
          />

          <Benefit
            icon={<ShieldCheck />}
            title="Compra segura"
            text="Pago protegido y seguro."
          />

          <Benefit
            icon={<Truck />}
            title="Despacho rápido"
            text="Retiro en tienda o envío a domicilio."
          />

          <Benefit
            icon={<Wrench />}
            title="Servicios profesionales"
            text="Instalación, balanceo y alineación."
          />
        </div>
      </section>
    </main>
  );
}

function Benefit({ icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
        {icon}
      </div>

      <h3 className="text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-white/55">
        {text}
      </p>
    </div>
  );
}
