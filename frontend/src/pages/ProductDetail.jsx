import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Wrench,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

const API_URL = "https://rivecor-store-production.up.railway.app/api";
const WHATSAPP_PHONE = "56959511138";

const services = [
  { id: "install", name: "Instalación", price: 20000 },
  { id: "balance", name: "Balanceo", price: 15000 },
  { id: "alignment", name: "Alineación", price: 25000 },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/products/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Producto no encontrado");
      }

      setProduct(data);
setSelectedImage(data.imageUrl);
      setQuantity(Number(data.stock || 0) > 0 ? 1 : 0);
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAddToCart = () => {
  if (!product || quantity <= 0) return;

  const selectedServiceObjects = services.filter((service) =>
    selectedServices.includes(service.id)
  );

  addItem({
  id: product.id,
  name: product.name,
  size: product.size,
  brand: product.brand,
  quantity,
  price: Number(product.offerPrice || product.price),
  image: product.imageUrl,

  instalacion: selectedServices.includes("install"),
  balanceo: selectedServices.includes("balance"),
  alineacion: selectedServices.includes("alignment"),
});

  navigate("/carrito");
};

const handleBuyNow = () => {
  if (!product || quantity <= 0) return;

  const selectedServiceObjects = services.filter((service) =>
    selectedServices.includes(service.id)
  );

  const directCheckoutItem = {
  id: product.id,
  name: product.name,
  size: product.size,
  brand: product.brand,
  quantity,
  price: Number(product.offerPrice || product.price),
  image: product.imageUrl,

  instalacion: selectedServices.includes("install"),
  balanceo: selectedServices.includes("balance"),
  alineacion: selectedServices.includes("alignment"),
};

  sessionStorage.setItem(
    "directCheckout",
    JSON.stringify([directCheckoutItem])
  );
console.log(
  "DIRECT CHECKOUT:",
  directCheckoutItem
);

console.log(
  "SESSION:",
  sessionStorage.getItem(
    "directCheckout"
  )
);
  navigate("/checkout?direct=true");
};

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070A0F] text-white">
        <p className="text-xl text-white/50">Cargando producto...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070A0F] px-6 text-white">
        <div className="text-center">
          <p className="text-xl text-red-400">Producto no encontrado</p>

          <Link
            to="/productos"
            className="mt-6 inline-flex rounded-2xl bg-yellow-400 px-6 py-4 font-black text-black"
          >
            Volver a productos
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock || 0);
  const unitPrice = Number(product.offerPrice || product.price || 0);

  const servicesTotal = selectedServices.reduce((acc, serviceId) => {
    const service = services.find((item) => item.id === serviceId);
    return acc + (service?.price || 0);
  }, 0);

  const total = unitPrice * quantity + servicesTotal;
  const whatsappMessage = `Hola 👋

Quiero consultar por este producto.

🛞 Producto: ${product.name}
🏷️ Marca: ${product.brand}
📏 Medida: ${product.size}
💰 Precio: $${unitPrice.toLocaleString("es-CL")}

🔗 Link:
${window.location.href}

¿Podrían ayudarme por favor?`;

const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
  whatsappMessage
)}`;

  const specs = [
    `Categoría ${product.category || "-"}`,
    `Aro ${product.rim || "-"}`,
    `Medida ${product.size || "-"}`,
    stock > 0 ? "Stock disponible" : "Sin stock",
  ];

  return (
    <main className="min-h-screen bg-[#070A0F] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/productos"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-white/50 transition hover:text-yellow-400"
        >
          <ArrowLeft size={18} />
          Volver a productos
        </Link>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]"
          >
            <div className="relative h-[520px] overflow-hidden rounded-3xl bg-[#F3F3F0]">
              {product.imageUrl ? (
                <img
  src={product.imageUrl}
  alt={product.name}
  className="h-full w-full object-contain p-10 transition duration-500 hover:scale-105"
/>
              ) : (
                <div className="flex h-full items-center justify-center text-white/30">
                  Sin imagen
                </div>
              )}



              <div className="absolute left-6 top-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#F9DD6F] px-4 py-2 text-xs font-black text-black shadow-sm">
  {product.brand}
</span>

                <span className="rounded-full bg-[#5B6372] px-4 py-2 text-xs font-bold text-white shadow-sm">
  {product.category}
</span>

                <span
  className={`rounded-full px-4 py-2 text-xs font-black shadow-sm ${
    stock > 0
      ? "bg-[#71705C] text-white"
      : "bg-red-500/15 text-red-500"
  }`}
>
  {stock > 0 ? `Stock disponible` : "Sin stock"}
</span>
              </div>

              <div className="absolute bottom-5 left-5">
  <span className="rounded-full bg-[#F9DD6F] px-4 py-2 text-sm font-black text-black shadow-sm">
    {product.size}
  </span>
</div>
            </div>

            <div className="grid gap-4 border-t border-[#C1B782]/20 bg-[#5B6372]/10 p-6 md:grid-cols-3">
              <Info
  icon={<ShieldCheck />}
  title="Compra con respaldo"
  text="Producto con garantía"
/>
              <Info
  icon={<Truck />}
  title="Retiro o despacho"
  text="Elige cómo recibir tu compra"
/>
              <Info
  icon={<Wrench />}
  title="Instalación disponible"
  text="Agrega el servicio al comprar"
/>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl"
          >
            <div>
  <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C1B782]">
    Neumático
  </p>

  <h2 className="mt-3 text-4xl font-black tracking-tight">
    {product.name}
  </h2>

  <div className="mt-4 flex flex-wrap gap-2">
    <span className="rounded-full bg-[#F9DD6F] px-3 py-1 text-xs font-black text-black">
      {product.brand}
    </span>

    <span className="rounded-full bg-[#5B6372] px-3 py-1 text-xs font-bold text-white">
      {product.category}
    </span>

    <span className="rounded-full border border-[#C1B782]/30 px-3 py-1 text-xs font-bold text-[#C1B782]">
      {product.size}
    </span>
  </div>
</div>
  <div className="mt-7">
  <p className="mb-1 text-sm font-bold text-white/40">
    Precio por unidad
  </p>

  {product.offerPrice ? (
    <div>
      <p className="text-lg text-white/30 line-through">
        ${Number(product.price).toLocaleString("es-CL")}
      </p>

      <p className="text-5xl font-black text-[#F9DD6F]">
        ${Number(product.offerPrice).toLocaleString("es-CL")}
      </p>

      <span className="mt-2 inline-flex rounded-full bg-[#71705C] px-3 py-1 text-xs font-black text-white">
        Precio oferta
      </span>
    </div>
  ) : (
    <p className="text-5xl font-black text-[#F9DD6F]">
      ${Number(product.price).toLocaleString("es-CL")}
    </p>
  )}
</div>
                

            <div
  className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 ${
    stock > 0
      ? "border-[#71705C]/40 bg-[#71705C]/10 text-white"
      : "border-red-400/20 bg-red-400/10 text-red-400"
  }`}
>
  <span
    className={`h-3 w-3 rounded-full ${
      stock > 0 ? "bg-[#71705C]" : "bg-red-400"
    }`}
  />

  <div>
    <p className="font-bold">
      {stock > 0 ? "Disponible para compra" : "Producto sin stock"}
    </p>

    {stock > 0 && (
      <p className="mt-1 text-sm text-white/45">
        {stock} {stock === 1 ? "unidad disponible" : "unidades disponibles"}
      </p>
    )}
  </div>
</div>

            <div className="mt-7">
  <div className="mb-3 flex items-center justify-between">
    <label className="text-sm font-bold text-white/60">
      Cantidad
    </label>

    <span className="text-xs text-white/35">
      Por unidad
    </span>
  </div>

  <div className="flex w-fit items-center overflow-hidden rounded-2xl border border-[#5B6372]/40 bg-[#0B0F17]">
    <button
      type="button"
      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
      disabled={stock <= 0}
      className="flex h-12 w-12 items-center justify-center text-white transition hover:bg-[#5B6372]/20 hover:text-[#F9DD6F] disabled:opacity-30"
    >
      <Minus size={18} />
    </button>

    <span className="flex h-12 min-w-14 items-center justify-center border-x border-[#5B6372]/30 text-lg font-black">
      {quantity}
    </span>

    <button
      type="button"
      onClick={() =>
        setQuantity((q) => Math.min(stock, q + 1))
      }
      disabled={stock <= 0}
      className="flex h-12 w-12 items-center justify-center text-white transition hover:bg-[#5B6372]/20 hover:text-[#F9DD6F] disabled:opacity-30"
    >
      <Plus size={18} />
    </button>
</div>
            </div>

            <div className="mt-7">
  <div className="mb-3">
    <label className="text-sm font-bold text-white/60">
      ¿Necesitas algún servicio?
    </label>

    <p className="mt-1 text-xs text-white/35">
      Puedes agregarlo junto con tus neumáticos.
    </p>
  </div>

  <div className="grid gap-3">
    {services.map((service) => {
      const active = selectedServices.includes(service.id);

      return (
        <button
          type="button"
          key={service.id}
          onClick={() => toggleService(service.id)}
          className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
            active
              ? "border-[#F9DD6F] bg-[#F9DD6F]/10"
              : "border-[#5B6372]/30 bg-[#0B0F17] hover:border-[#C1B782]/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                active
                  ? "border-[#F9DD6F] bg-[#F9DD6F] text-black"
                  : "border-white/20 bg-black/20"
              }`}
            >
              {active && <CheckCircle2 size={16} />}
            </span>

            <div>
              <p
                className={`font-bold ${
                  active ? "text-[#F9DD6F]" : "text-white"
                }`}
              >
                {service.name}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Servicio adicional
              </p>
            </div>
          </div>

          <span className="font-black text-[#C1B782]">
            +${service.price.toLocaleString("es-CL")}
          </span>
        </button>
      );
    })}
  </div>
</div>

            
            <div className="mt-7 rounded-2xl border border-[#5B6372]/30 bg-[#0B0F17] p-5">
  <div className="flex justify-between text-sm text-white/45">
    <span>Productos</span>
    <span className="font-bold text-white/70">
      ${(unitPrice * quantity).toLocaleString("es-CL")}
    </span>
  </div>

  {servicesTotal > 0 && (
    <div className="mt-3 flex justify-between text-sm text-white/45">
      <span>Servicios</span>
      <span className="font-bold text-white/70">
        ${servicesTotal.toLocaleString("es-CL")}
      </span>
    </div>
  )}

  <div className="my-5 border-t border-[#5B6372]/30" />

  <div className="flex items-end justify-between gap-4">
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-white/35">
        Total de esta compra
      </p>

      <p className="mt-1 text-sm text-white/40">
        Impuestos incluidos
      </p>
    </div>

    <span className="text-3xl font-black text-[#F9DD6F]">
      ${total.toLocaleString("es-CL")}
    </span>
  </div>
</div>

            <button
  type="button"
  onClick={handleAddToCart}
  disabled={stock <= 0 || quantity <= 0}
  className="mt-6 w-full rounded-2xl bg-[#F9DD6F] px-6 py-5 text-lg font-black text-black transition hover:bg-[#C1B782] disabled:cursor-not-allowed disabled:opacity-40"
>
  Agregar al carrito
</button>

            <button
  type="button"
  onClick={handleBuyNow}
  disabled={stock <= 0 || quantity <= 0}
  className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#C1B782]/40 bg-[#5B6372]/10 px-6 py-5 text-lg font-black text-white transition hover:border-[#F9DD6F] hover:bg-[#F9DD6F]/10 hover:text-[#F9DD6F] disabled:cursor-not-allowed disabled:opacity-40"
>
  Comprar ahora
</button>
<a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 flex w-full items-center justify-center rounded-2xl border border-[#71705C]/40 bg-[#71705C]/10 px-6 py-4 font-bold text-[#C1B782] transition hover:border-[#C1B782] hover:bg-[#71705C]/20"
>
  ¿Tienes dudas? Escríbenos
</a>
          </motion.aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.7fr]">

  <div className="rounded-[2rem] border border-[#5B6372]/30 bg-[#0B0F17] p-8">
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F9DD6F] text-black">
        <ShieldCheck size={20} />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#C1B782]">
          Información
        </p>

        <h3 className="text-2xl font-black">
          Sobre este producto
        </h3>
      </div>
    </div>

    <p className="leading-8 text-white/55">
      {product.description ||
        "Producto disponible para operaciones automotrices, flotas y maquinaria."}
    </p>
  </div>

  <div className="rounded-[2rem] border border-[#5B6372]/30 bg-[#0B0F17] p-8">
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#C1B782]">
        Datos del producto
      </p>

      <h3 className="mt-1 text-2xl font-black">
        Características
      </h3>
    </div>

    <div className="grid gap-3">
      {specs.map((spec) => (
        <div
          key={spec}
          className="flex items-center gap-3 rounded-xl border border-[#5B6372]/20 bg-[#5B6372]/10 px-4 py-3 text-sm text-white/70"
        >
          <CheckCircle2
            size={18}
            className="shrink-0 text-[#F9DD6F]"
          />

          <span>{spec}</span>
        </div>
      ))}
    </div>
  </div>

</section>
      </div>
    </main>
  );
}

function Info({ icon, title, text }) {
  return (
    <div className="rounded-2xl bg-black/35 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black">
        {icon}
      </div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-1 text-sm text-white/45">{text}</p>
    </div>
  );
}