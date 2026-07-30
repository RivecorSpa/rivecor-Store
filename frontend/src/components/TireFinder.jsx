import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Truck,
  Tractor,
  Warehouse,
  Bus,
} from "lucide-react";
import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;
const tireImages = {
  AUTO: "/tire-auto.png",
  SUV: "/tire-suv.png",
  CAMIONETA: "/tire-camioneta.png",
  CAMION: "/tire-camion.png",
  AGRICOLA: "/tire-agricola.png",
  INDUSTRIAL: "/tire-industrial.png",
  BUS: "/tire-bus.png",
};

const categories = [
  {
    id: "AUTO",
    name: "Auto",
    icon: Car,
  },
  {
    id: "SUV",
    name: "SUV",
    icon: Car,
  },
  {
    id: "CAMIONETA",
    name: "Camioneta",
    icon: Car,
  },
  {
    id: "CAMION",
    name: "Camión",
    icon: Truck,
  },
  {
    id: "AGRICOLA",
    name: "Agrícola",
    icon: Tractor,
  },
  {
    id: "INDUSTRIAL",
    name: "Industrial",
    icon: Warehouse,
  },
  {
    id: "BUS",
    name: "Bus",
    icon: Bus,
  },
];

export default function TireFinder() {

    const [category, setCategory] = useState("AUTO");
  const [width, setWidth] = useState("");
  const [profile, setProfile] = useState("");
  const [rim, setRim] = useState("");

  const [widths, setWidths] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [rims, setRims] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/products/filters?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setWidths(data.widths || []);
        setProfiles(data.profiles || []);
        setRims(data.rims || []);
      })
      .catch(console.error);
  }, [category]);
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      className="overflow-hidden rounded-[32px] border border-white/10 bg-[#10151d] shadow-2xl"
    >
      {/* Categorías */}
      <div className="grid grid-cols-2 md:grid-cols-7 bg-[#0B1018] border-b border-white/10">

        {categories.map((item) => {

          const Icon = item.icon;

          return (
            <button
  key={item.id}
  onClick={() => {
  setCategory(item.id);
  setWidth("");
  setProfile("");
  setRim("");
}}
  className={`
    relative
    flex
    flex-col
    items-center
    justify-center
    gap-2
    py-5
    transition-all
    duration-300

    ${
      category === item.id
        ? "bg-yellow-400 text-black"
        : "text-white/60 hover:bg-white/5"
    }
  `}
>
  <Icon size={24} />

  <span className="text-[11px] font-black uppercase">
    {item.name}
  </span>
</button>
          );
        })}
      </div>

      {/* Contenido */}

      <div className="p-8">

        <img
  src={tireImages[category]}
  alt={category}
  className="mx-auto mb-4 h-40 object-contain transition-all duration-500"
/>

        <h2 className="text-center text-3xl font-black">
          Busca tu neumático
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-3">

  {/* ANCHO */}
  <select
  value={width}
  onChange={(e) => {
    setWidth(e.target.value);
    setProfile("");
    setRim("");
  }}
  className="rounded-2xl border border-white/10 bg-[#070A0F] px-5 py-4 text-white"
>
    
  <option value="">Ancho</option>

  {widths.map((w) => (
    <option key={w} value={w}>
  {w}
</option>
  ))}
</select>

  {/* PERFIL */}
  <select
  value={profile}
  onChange={(e) => {
    setProfile(e.target.value);
    setRim("");
  }}
  className="rounded-2xl border border-white/10 bg-[#070A0F] px-5 py-4 text-white"
>
  <option value="">Perfil</option>

  {profiles.map((p) => (
    <option key={p} value={p}>
  {p}
</option>
  ))}
</select>


  {/* ARO */}
  <select
  value={rim}
  onChange={(e) => setRim(e.target.value)}
  className="rounded-2xl border border-white/10 bg-[#070A0F] px-5 py-4 text-white"
>
  <option value="">Aro</option>

  {rims.map((r) => (
    <option key={r} value={r}>
  {r}
</option>
  ))}
</select>

</div>

        <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-center">

          <span className="text-white/50">
            Medida seleccionada
          </span>

          <p className="mt-2 text-2xl font-black text-yellow-400">

{width && profile && rim
  ? `${width}/${profile}R${rim}`
  : "Seleccione una medida"}

</p>
        
          

        </div>

        <button
  onClick={() =>
    navigate(
      `/productos?category=${category}&width=${width}&profile=${profile}&rim=${rim}`
    )
  }
  className="mt-6 w-full rounded-2xl bg-yellow-400 py-4 text-lg font-black text-black transition hover:bg-yellow-300"
>
  🔍 Buscar neumáticos
</button>

      </div>
    </motion.div>
  );
}