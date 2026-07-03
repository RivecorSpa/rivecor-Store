import { useEffect, useState } from "react";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";


const STATUS = [
  "PENDIENTE",
  "PAGADO",
  "PREPARANDO",
  "ENVIADO",
  "ENTREGADO",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showDetail, setShowDetail] = useState(false);

  const fetchOrders = async () => {
    const res = await fetch(`${API_URL}/orders`);
    const data = await res.json();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

const updateStatus = async (order, status) => {
  try {
    const res = await fetch(
      `${API_URL}/orders/${order.id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const updated = await res.json();

    if (!res.ok) {
      throw new Error(updated.error);
    }
    // 🔄 actualizar UI
    
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? updated : o
      )
    );

    // 🔥 MENSAJE AUTOMÁTICO SEGÚN ESTADO
    let message = "";

    if (status === "PAGADO") {
      message = `✅ Pago confirmado\n\nTu pedido ${order.code} fue recibido correctamente.`;
    }

    if (status === "PREPARANDO") {
      message = `🛠️ Estamos preparando tu pedido ${order.code}.`;
    }

    if (status === "ENVIADO") {
      message = `🚚 Tu pedido ${order.code} ya va en camino.`;
    }

    if (status === "ENTREGADO") {
      message = `📦 Pedido ${order.code} entregado con éxito. ¡Gracias por tu compra!`;
    }

    // 📲 ENVIAR WHATSAPP SI HAY TELÉFONO
    if (order.customer?.phone && message) {
      const phone = order.customer.phone.replace(/\D/g, "");

      const fullMessage = `Hola ${order.customer.name || ""} 👋

${message}

Puedes ver tu pedido aquí:
${window.location.origin}/pedido/${order.code}`;

      window.open(
        `https://wa.me/56${phone}?text=${encodeURIComponent(fullMessage)}`,
        "_blank"
      );
    }

  } catch (error) {
    console.error(error);
    alert("Error actualizando estado");
  }
};;
const printOrder = (order) => {
  const pdf = new jsPDF();

  const logo = new Image();
  logo.src = "/logo.png";

  logo.onload = () => {

    // LOGO
    pdf.addImage(
      logo,
      "PNG",
      70,   // X
      10,   // Y
      70,   // ancho
      25    // alto
    );

    let y = 45;

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("COMPROBANTE DE PEDIDO", 105, y, {
      align: "center",
    });

    y += 15;

    pdf.setFontSize(12);

    pdf.text(`Pedido: ${order.code}`,20,y);

    y += 8;

    pdf.text(
      `Fecha: ${new Date(order.createdAt).toLocaleDateString("es-CL")}`,
      20,
      y
    );

    y += 15;

    pdf.setFontSize(14);
    pdf.setTextColor(255,170,0);

    pdf.text("CLIENTE",20,y);

    y += 8;

    pdf.setTextColor(0);

    pdf.setFontSize(11);

    pdf.text(order.customer?.name || "-",20,y);

    y += 7;

    pdf.text(order.customer?.email || "-",20,y);

    y += 7;

    pdf.text(order.customer?.phone || "-",20,y);

    y += 15;

    pdf.setTextColor(255,170,0);
    pdf.setFontSize(14);

    pdf.text("PRODUCTOS",20,y);

    y += 8;

    pdf.setTextColor(0);
    pdf.setFontSize(11);

    order.items?.forEach((item)=>{

      pdf.text(
        `${item.quantity} x ${item.name}`,
        20,
        y
      );

      pdf.text(
        `$${Number(item.total).toLocaleString("es-CL")}`,
        190,
        y,
        { align:"right" }
      );

      y += 8;

    });

    y += 5;

    pdf.line(20,y,190,y);

    y += 10;

    pdf.setFontSize(16);
    pdf.setTextColor(255,170,0);

    pdf.text("TOTAL",20,y);

    pdf.text(
      `$${Number(order.total).toLocaleString("es-CL")}`,
      190,
      y,
      { align:"right" }
    );

    y += 18;

    pdf.setTextColor(0);
    pdf.setFontSize(11);

    pdf.text(
      `Método de pago: ${order.paymentMethod || "No definido"}`,
      20,
      y
    );

    y += 8;

    pdf.text(
      `Estado: ${order.status}`,
      20,
      y
    );

    y += 18;

    pdf.setFontSize(10);

    pdf.text(
      "Gracias por comprar en Rivecor",
      105,
      y,
      {
        align:"center"
      }
    );

    pdf.save(`${order.code}.pdf`);
  };
};

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-black mb-6">
          Gestión de pedidos
        </h1>
        

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#0B0F17] p-5 rounded-2xl border border-white/10"
            >
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                <div>
                  <p className="font-bold break-all">{order.code}</p>
                  <p className="text-xs text-white/40">
                    {order.customer?.name}
                  </p>
                  <p className="text-xs text-white/40 break-all">
  {order.customer?.email}
</p>
                </div>
                <p className="text-sm mt-3 font-semibold">
  Productos
</p>
{order.address && (

<p className="text-xs text-white/40 mt-2">
  📍 {order.address || "Sin dirección"}
</p>

)}
<div className="mt-2 space-y-1">
  {order.items?.slice(0,3).map((item) => (
    <div
  key={item.id}
  className="flex justify-between items-center gap-4 text-sm"
>
      <span>
        {item.quantity} × {item.name}
      </span>

      <span>
        ${Number(item.total).toLocaleString("es-CL")}
      </span>
    </div>
  ))}
</div>

                <div className="text-right min-w-[180px]">
                  
                  <p className="text-xs">
                    {order.status}
                  </p>
                  <p className="text-yellow-400 text-2xl font-black">
  ${Number(order.total).toLocaleString("es-CL")}
</p>

<p className="text-sm text-white/50">
  💳 {order.paymentMethod || "No definido"}
</p>

<p className="text-xs text-green-400 font-bold">
  {order.paymentStatus === "PENDING"
    ? "Pendiente"
    : order.paymentStatus === "PAID"
    ? "Pagado"
    : order.paymentStatus === "FAILED"
    ? "Rechazado"
    : order.paymentStatus}
</p>
                </div>
              </div>

              {/* 🔥 BOTONES DE ESTADO */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mt-4">
                {STATUS.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(order, s)}
                    className={`w-full sm:w-auto px-3 py-2 rounded-lg text-xs font-bold text-center transition ${
  order.status === s
    ? "bg-green-400 text-black"
    : "bg-white/10 hover:bg-white/20"
}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
<div className="flex flex-wrap gap-3 mt-6">

  <button
  onClick={() => {
    setSelectedOrder(order);
    setShowDetail(true);
  }}
  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
>
  👁 Ver detalle
</button>

  <button
onClick={() => printOrder(order)}
className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700"
>
🧾 Imprimir
</button>

  <button className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition">
    💬 WhatsApp
  </button>

</div>
            </div>
          ))}
          
        </div>
        

      </div>
      {showDetail && selectedOrder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">

    <div className="w-full max-w-4xl rounded-3xl bg-[#0B0F17] border border-white/10 p-8">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h2 className="text-3xl font-black">
            {selectedOrder.code}
          </h2>

          <p className="text-white/40">
            Detalle completo del pedido
          </p>
        </div>

        <button
          onClick={() => setShowDetail(false)}
          className="text-3xl text-white/40 hover:text-white"
        >
          ✕
        </button>

      </div>

      <div className="grid md:grid-cols-2 gap-8">

        <div>

          <h3 className="font-bold text-yellow-400 mb-4">
            Cliente
          </h3>

          <div className="space-y-2 text-white/70">

            <p>👤 {selectedOrder.customer?.name}</p>

            <p>✉ {selectedOrder.customer?.email}</p>

            <p>📞 {selectedOrder.customer?.phone || "-"}</p>

            <p>📍 {selectedOrder.address || "-"}</p>

          </div>

        </div>

        <div>

          <h3 className="font-bold text-yellow-400 mb-4">
            Pago
          </h3>

          <div className="space-y-2">

            <p>
              Total:
              <span className="ml-2 text-yellow-400 font-black">
                ${Number(selectedOrder.total).toLocaleString("es-CL")}
              </span>
            </p>

            <p>
              Método:
              <span className="ml-2">
                {selectedOrder.paymentMethod || "Sin método"}
              </span>
            </p>

            <p>
              Estado:
              <span className="ml-2 text-green-400">
                {selectedOrder.paymentStatus === "PENDING"
  ? "Pendiente"
  : selectedOrder.paymentStatus === "PAID"
  ? "Pagado"
  : selectedOrder.paymentStatus === "FAILED"
  ? "Rechazado"
  : selectedOrder.paymentStatus || "Pendiente"}
              </span>
            </p>

          </div>

        </div>

      </div>

      <div className="mt-10">

        <h3 className="font-bold text-yellow-400 mb-5">
          Productos
        </h3>

        <div className="space-y-3">

          {selectedOrder.items?.length ? (
  selectedOrder.items.map((item) => (
    <div
      key={item.id}
      className="flex justify-between rounded-xl bg-white/5 p-4"
    >
      <div>
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-white/50">
          Cantidad: {item.quantity}
        </p>
      </div>

      <strong className="text-yellow-400">
        ${Number(item.total).toLocaleString("es-CL")}
      </strong>
    </div>
  ))
) : (
  <p className="text-white/40">
    No hay productos asociados a este pedido.
  </p>
)}

        </div>

      </div>

      <div className="mt-10 flex justify-end gap-3">

        <button
          onClick={() => printOrder(selectedOrder)}
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700"
        >
          🧾 Imprimir
        </button>

        <button
          onClick={() => setShowDetail(false)}
          className="px-5 py-3 rounded-xl bg-yellow-400 text-black font-bold"
        >
          Cerrar
        </button>

      </div>

    </div>

  </div>
)}
    </main>
  );
}
