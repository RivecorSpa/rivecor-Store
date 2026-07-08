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
            <div className="relative h-[520px] overflow-hidden bg-black">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/30">
                  Sin imagen
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute left-6 top-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-yellow-400 px-4 py-2 text-xs font-black text-black">
                  {product.brand}
                </span>

                <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-bold text-white">
                  {product.category}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    stock > 0
                      ? "bg-green-400/15 text-green-400"
                      : "bg-red-400/15 text-red-400"
                  }`}
                >
                  {stock > 0 ? `Stock ${stock}` : "Sin stock"}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-sm font-bold text-yellow-400">
                  Medida {product.size}
                </p>
                <h1 className="mt-2 text-5xl font-black">{product.name}</h1>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-3">
              <Info
                icon={<ShieldCheck />}
                title="Garantía"
                text="Producto respaldado"
              />
              <Info icon={<Truck />} title="Entrega" text="Retiro o despacho" />
              <Info
                icon={<Wrench />}
                title="Servicio"
                text="Instalación disponible"
              />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-fit rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-yellow-400">
              Configurar compra
            </p>

            <h2 className="mt-3 text-4xl font-black">{product.name}</h2>

            <p className="mt-3 text-white/50">
              {product.size} · Aro {product.rim} · {product.category}
            </p>

            <div className="mt-7">
              {product.offerPrice ? (
                <div>
                  <p className="text-lg text-white/30 line-through">
                    ${Number(product.price).toLocaleString("es-CL")}
                  </p>
                  <p className="text-5xl font-black text-yellow-400">
                    ${Number(product.offerPrice).toLocaleString("es-CL")}
                  </p>
                </div>
              ) : (
                <p className="text-5xl font-black text-yellow-400">
                  ${Number(product.price).toLocaleString("es-CL")}
                </p>
              )}
            </div>

            <div
              className={`mt-6 rounded-2xl border p-4 ${
                stock > 0
                  ? "border-green-400/20 bg-green-400/10 text-green-400"
                  : "border-red-400/20 bg-red-400/10 text-red-400"
              }`}
            >
              {stock > 0
                ? `Stock disponible: ${stock} unidades`
                : "Producto sin stock"}
            </div>

            <div className="mt-7">
              <label className="mb-3 block text-sm font-bold text-white/60">
                Cantidad
              </label>

              <div className="flex w-fit items-center rounded-2xl border border-white/10 bg-black/40">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={stock <= 0}
                  className="p-4 text-white hover:text-yellow-400 disabled:opacity-30"
                >
                  <Minus size={18} />
                </button>

                <span className="min-w-12 text-center text-xl font-black">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(stock, q + 1))
                  }
                  disabled={stock <= 0}
                  className="p-4 text-white hover:text-yellow-400 disabled:opacity-30"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="mt-7">
              <label className="mb-3 block text-sm font-bold text-white/60">
                Servicios adicionales
              </label>

              <div className="grid gap-3">
                {services.map((service) => {
                  const active = selectedServices.includes(service.id);

                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service.id)}
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-yellow-400 bg-yellow-400 text-black"
                          : "border-white/10 bg-black/35 text-white hover:border-yellow-400"
                      }`}
                    >
                      <span className="font-bold">{service.name}</span>
                      <span className="font-black">
                        ${service.price.toLocaleString("es-CL")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-black/45 p-5">
              <div className="flex justify-between text-white/50">
                <span>Subtotal productos</span>
                <span>${(unitPrice * quantity).toLocaleString("es-CL")}</span>
              </div>

              <div className="mt-3 flex justify-between text-white/50">
                <span>Servicios</span>
                <span>${servicesTotal.toLocaleString("es-CL")}</span>
              </div>

              <div className="mt-5 flex justify-between border-t border-white/10 pt-5 text-2xl font-black">
                <span>Total</span>
                <span className="text-yellow-400">
                  ${total.toLocaleString("es-CL")}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || quantity <= 0}
              className="mt-6 w-full rounded-2xl bg-yellow-400 px-6 py-5 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Agregar al carrito
            </button>

            <button
  onClick={handleBuyNow}
  disabled={stock <= 0 || quantity <= 0}
  className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 px-6 py-5 text-lg font-black text-white transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
>
  Comprar ahora
</button>
<a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-3 flex w-full items-center justify-center rounded-2xl bg-green-500 px-6 py-5 text-lg font-black text-white transition hover:bg-green-600"
>
  Consultar por WhatsApp
</a>
          </motion.aside>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8">
            <h3 className="text-3xl font-black">Descripción</h3>
            <p className="mt-4 leading-8 text-white/55">
              {product.description ||
                "Producto disponible para operaciones automotrices, flotas y maquinaria."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-8">
            <h3 className="text-3xl font-black">Características</h3>

            <div className="mt-5 grid gap-3">
              {specs.map((spec) => (
                <div
                  key={spec}
                  className="flex items-center gap-3 text-white/65"
                >
                  <CheckCircle2 size={18} className="text-yellow-400" />
                  {spec}
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