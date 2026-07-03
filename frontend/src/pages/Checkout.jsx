import { useState } from "react";
import { useCart } from "../context/CartContext";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3001/api";

export default function Checkout() {
  const {
    items,
    clearCart,
  } = useCart();

  const params =
    new URLSearchParams(
      window.location.search
    );

  const isDirect =
    params.get("direct") === "true";

  const directItems =
    JSON.parse(
      sessionStorage.getItem(
        "directCheckout"
      ) || "[]"
    );

  const checkoutItems =
    isDirect
      ? directItems
      : items;

  const checkoutSubtotal =
    checkoutItems.reduce(
      (acc, item) =>
        acc +
        Number(item.price) *
          Number(item.quantity),
      0
    );

  const [form, setForm] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
const [loading, setLoading] = useState(false);
  const SHIPPING_COST = 12990;

const [shippingType, setShippingType] =
  useState("retiro");

const BALANCEO = 10000;
const ALINEACION = 15000;
const INSTALACION = 20000;

const hasBalanceo =
  checkoutItems.some(item => item.balanceo);

const hasAlineacion =
  checkoutItems.some(item => item.alineacion);

const hasInstalacion =
  checkoutItems.some(item => item.instalacion);

const servicesTotal =
  (hasBalanceo ? BALANCEO : 0) +
  (hasAlineacion ? ALINEACION : 0) +
  (hasInstalacion ? INSTALACION : 0);
  



const shipping =
  shippingType === "envio"
    ? SHIPPING_COST
    : 0;

const total =
  checkoutSubtotal +
  servicesTotal +
  shipping;

  if (
    !checkoutItems ||
    checkoutItems.length === 0
  ) {
    return (
      <div className="text-white p-20 text-center">
        🛒 Tu carrito está vacío
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    // Crear pedido
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: form,
        items: checkoutItems.map((i) => ({
          productId: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          total: i.price * i.quantity,
        })),
        total: total,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error("Error creando pedido");
    }

    // Crear sesión Getnet
    const getnetRes = await fetch(
      `${API_URL}/getnet/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderCode: orderData.code,
          amount: total,
          customerName: form.name,
          customerEmail: form.email,
        }),
      }
    );

    const getnetData = await getnetRes.json();
    localStorage.setItem(
  "getnetRequestId",
  getnetData.requestId
);

    console.log("GETNET", getnetData);

    if (!getnetData.processUrl) {
      throw new Error("Getnet no devolvió processUrl");
    }

    window.location.href =
      getnetData.processUrl;

  } catch (error) {
    console.error(error);

    alert(
      "Error conectando con Getnet"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-6 flex justify-center">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">

        {/* 🧾 RESUMEN */}
        <div className="bg-[#0B0F17] p-6 rounded-3xl border border-white/10 shadow-xl">

          <h2 className="text-2xl font-black mb-6">
            🛒 Resumen del pedido
          </h2>

          <div className="space-y-4">

  {checkoutItems.map((item) => (

    <div
      key={item.id}
      className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-4"
    >

      <img
        src={item.image}
        alt={item.name}
        className="h-20 w-20 rounded-xl object-cover bg-white"
      />

      <div className="flex-1">

        <h3 className="font-bold text-lg">
          {item.name}
        </h3>

        <p className="text-white/40 text-sm">
          Cantidad: {item.quantity}
        </p>

        <p className="text-yellow-400 font-bold mt-1">
          ${Number(item.price).toLocaleString("es-CL")}
        </p>

      </div>

      <div className="text-right">

        <p className="font-black text-xl">
          $
          {Number(item.price * item.quantity).toLocaleString("es-CL")}
        </p>

      </div>

    </div>

  ))}

</div>

{/* 👇 AQUÍ VA EL PUNTO 4 */}
<div className="mt-6 rounded-2xl bg-black/40 p-5 border border-yellow-400/20">

  <div className="flex justify-between mb-2">
    <span className="text-white/60">Subtotal</span>
    <span>${checkoutSubtotal.toLocaleString("es-CL")}</span>
  </div>

  {hasInstalacion && (
  <div className="flex justify-between mb-2">
    <span className="text-white/60">
      Instalación
    </span>
    <span>
      ${INSTALACION.toLocaleString("es-CL")}
    </span>
  </div>
)}

{hasBalanceo && (
  <div className="flex justify-between mb-2">
    <span className="text-white/60">
      Balanceo
    </span>
    <span>
      ${BALANCEO.toLocaleString("es-CL")}
    </span>
  </div>
)}

{hasAlineacion && (
  <div className="flex justify-between mb-2">
    <span className="text-white/60">
      Alineación
    </span>
    <span>
      ${ALINEACION.toLocaleString("es-CL")}
    </span>
  </div>
)}

  <div className="flex justify-between">
    <span className="text-white/60">Envío</span>
    <span>
      {shipping === 0
        ? "GRATIS"
        : `$${shipping.toLocaleString("es-CL")}`}
    </span>
  </div>

  <div className="my-4 border-t border-white/10"></div>

  <div className="flex justify-between items-center">

    <span className="text-xl font-bold">
      TOTAL
    </span>

    <span className="text-4xl font-black text-yellow-400">
      ${total.toLocaleString("es-CL")}
    </span>

  </div>

</div>
</div>

        {/* 📦 FORM */}
        <div className="bg-[#0B0F17] p-6 rounded-3xl border border-white/10 shadow-xl">

          <h2 className="text-2xl font-black mb-6">
            📦 Datos de envío
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
<div className="mb-6">


<h3 className="font-bold mb-3">
Tipo de entrega
</h3>

<label className="flex items-center gap-3 mb-3">

<input
type="radio"
name="shipping"
checked={shippingType==="retiro"}
onChange={()=>setShippingType("retiro")}
/>

Retiro en bodega
</label>

<label className="flex items-center gap-3">

<input
type="radio"
name="shipping"
checked={shippingType==="envio"}
onChange={()=>setShippingType("envio")}
/>

Envío a domicilio
</label>

</div>
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={form.name}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-black border border-white/10 focus:border-yellow-400 outline-none"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-black border border-white/10 focus:border-yellow-400 outline-none"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-black border border-white/10 focus:border-yellow-400 outline-none"
              required
            />

            {shippingType === "envio" && (

<input
type="text"
name="address"
placeholder="Dirección"
value={form.address}
onChange={handleChange}
className="w-full p-4 rounded-xl bg-black border border-white/10 focus:border-yellow-400 outline-none"
/>

)}

            {/* BOTÓN PRO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-yellow-400 text-black font-black py-4 rounded-2xl text-lg hover:scale-105 transition"
            >
              {loading ? "Procesando..." : "Confirmar pedido"}
            </button>
            <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/5 p-5">

  <h3 className="text-lg font-bold text-green-400">
    ❓ ¿Necesitas ayuda?
  </h3>

  <p className="mt-2 text-sm text-white/60">
    Si tienes dudas sobre stock, compatibilidad, despacho o instalación,
    nuestros especialistas pueden ayudarte antes de finalizar tu compra.
  </p>

  <button
    type="button"
    onClick={() =>
      window.open(
        `https://wa.me/569XXXXXXXX?text=${encodeURIComponent(
          `Hola, necesito ayuda con mi compra.\n\nEstoy realizando un pedido en Rivecor Store y tengo una consulta antes de pagar.`
        )}`,
        "_blank"
      )
    }
    className="mt-4 w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 transition"
  >
    💬 Hablar con un especialista
  </button>

</div>

          </form>
        </div>

      </div>
    </main>
  );
}