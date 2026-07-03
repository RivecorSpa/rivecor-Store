import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export default function PedidoTracking() {
  const { code } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/code/${code}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [code]);

  // 🔥 BOTÓN PAGADO
  const markAsPaid = async () => {
    try {
      const phone = "569XXXXXXXX";

      const message = `Hola, ya realicé el pago del pedido ${order.code} 💰`;

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      const res = await fetch(
        `${API_URL}/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "PAGADO",
            paymentStatus: "PAID",
          }),
        }
      );

      const updated = await res.json();

      if (!res.ok) throw new Error(updated.error);

      setOrder(updated);
    } catch (error) {
      console.error(error);
      alert("Error actualizando estado");
    }
  };

  if (loading) return <div className="text-white p-10">Cargando...</div>;
  if (!order) return <div className="text-white p-10">No encontrado</div>;

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-[#0B0F17] rounded-3xl p-8">

        {/* HEADER */}
        <h1 className="text-4xl font-black text-yellow-400 text-center">
          Pedido
        </h1>

        <p className="text-center mt-2 text-white/50">
          {order.code}
        </p>

        {/* TOTAL */}
        <div className="mt-6 text-center">
          <p>Total</p>
          <p className="text-3xl text-yellow-400 font-black">
            ${Number(order.total).toLocaleString("es-CL")}
          </p>
        </div>

        {/* ESTADO */}
        <div className="mt-6 text-center">
          <p>Estado</p>
          <p className="text-xl font-bold">
            {order.status}
          </p>
        </div>

        {/* BOTÓN */}
        {order.status === "PENDIENTE" && (
          <button
            onClick={markAsPaid}
            className="mt-6 w-full bg-green-400 text-black font-black py-4 rounded-2xl"
          >
            Ya pagué
          </button>
        )}

        {/* PRODUCTOS */}
        <div className="mt-8">
          <h2 className="text-xl font-black mb-4">
            Productos
          </h2>

          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>{item.name}</span>
              <span>${item.total}</span>
            </div>
          ))}
        </div>

        {/* 🔥 TIMELINE */}
        <div className="mt-10">
          <h2 className="text-xl font-black mb-4">
            Historial del pedido
          </h2>

          <div className="space-y-4">
            {order.history?.map((h, index) => (
              <div key={index} className="flex items-start gap-4">

                {/* línea */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      h.status === order.status
                        ? "bg-green-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  {index !== order.history.length - 1 && (
                    <div className="w-[2px] h-10 bg-white/20" />
                  )}
                </div>

                {/* contenido */}
                <div>
                  <p
                    className={`font-bold ${
                      h.status === order.status
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {h.status}
                  </p>

                  <p className="text-xs text-white/40">
                    {new Date(h.date).toLocaleString("es-CL")}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}