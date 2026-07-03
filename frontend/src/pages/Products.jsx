import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Truck, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3001/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [rim, setRim] = useState("Todos");
  const [brand, setBrand] = useState("Todas");
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.brand} ${product.category} ${product.size}`.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchCategory =
        category === "Todas" || product.category === category;
      const matchRim = rim === "Todos" || String(product.rim) === String(rim);
      const matchBrand = brand === "Todas" || product.brand === brand;

      return matchSearch && matchCategory && matchRim && matchBrand;
    });
  }, [products, search, category, rim, brand]);

  const categories = ["Todas", ...new Set(products.map((p) => p.category))];
  const rims = ["Todos", ...new Set(products.map((p) => String(p.rim)))];
  const brands = ["Todas", ...new Set(products.map((p) => p.brand))];

  return (
    <main className="min-h-screen bg-[#070A0F] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-400">
            Catálogo Rivecor Store
          </span>

          <h1 className="mt-6 text-5xl font-black md:text-6xl">
            Neumáticos para todo tipo de operación
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/55">
            Productos cargados directamente desde el panel administrador.
          </p>
        </div>

        <section className="mb-12 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black">Buscar producto compatible</h2>
              <p className="text-sm text-white/45">
                Filtra por categoría, aro, medida o marca.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">
                Buscar
              </label>
              <div className="flex items-center rounded-2xl border border-white/10 bg-black/40 px-4">
                <Search size={18} className="text-white/35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej: Michelin, 295/80 R22.5, camioneta..."
                  className="w-full bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/25"
                />
              </div>
            </div>

            <Filter label="Categoría" value={category} onChange={setCategory} options={categories} />
            <Filter label="Aro" value={rim} onChange={setRim} options={rims} />
            <Filter label="Marca" value={brand} onChange={setBrand} options={brands} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Chip icon={<Truck size={16} />} text="Camión" onClick={() => setCategory("Camión")} />
            <Chip icon={<Wrench size={16} />} text="Maquinaria pesada" onClick={() => setCategory("Maquinaria pesada")} />
            <Chip text="Stock disponible" />
            <Chip text="Instalación" />
          </div>
        </section>

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center text-white/50">
            Cargando productos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
            <h2 className="text-2xl font-black">No hay productos</h2>
            <p className="mt-2 text-white/45">
              Sube productos desde el panel administrador.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]"
              >
                <div className="relative h-[260px] overflow-hidden bg-black">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/25">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
                      {product.brand}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <p className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                      {product.category}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-sm font-bold text-yellow-400">
                    {product.size}
                  </p>

                  <h2 className="mt-2 min-h-[68px] text-2xl font-black">
                    {product.name}
                  </h2>

                  <div className="mt-4">
                    {product.offerPrice ? (
                      <>
                        <p className="text-sm text-white/30 line-through">
                          ${Number(product.price).toLocaleString("es-CL")}
                        </p>
                        <strong className="text-3xl text-yellow-400">
                          ${Number(product.offerPrice).toLocaleString("es-CL")}
                        </strong>
                      </>
                    ) : (
                      <strong className="text-3xl text-yellow-400">
                        ${Number(product.price).toLocaleString("es-CL")}
                      </strong>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-green-400">
                      Stock: {product.stock}
                    </span>
                    <span className="text-white/40">Aro {product.rim}</span>
                  </div>

                  <Link
                    to={`/productos/${product.id}`}
                    className="mt-6 flex items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-300"
                  >
                    Ver detalles
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Filter({ label, options, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/40">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-white outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Chip({ text, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-yellow-400 hover:text-yellow-400"
    >
      {icon}
      {text}
    </button>
  );
}