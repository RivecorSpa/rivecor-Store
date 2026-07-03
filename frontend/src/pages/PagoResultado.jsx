
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

export default function PagoResultado() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
  const requestId = localStorage.getItem(
    "getnetRequestId"
  );

  console.log(
    "REQUEST ID:",
    requestId
  );

  if (!requestId) {
    setError("No se encontró la transacción");
    setLoading(false);
    return;
  }

  api
  .get(`/getnet/status/${requestId}`)
  .then(({ data }) => {
  setOrder(data.order);

  localStorage.removeItem(
    "getnetRequestId"
  );

  if (
    data.order?.paymentStatus ===
    "PAID"
  ) {
    sessionStorage.removeItem(
      "directCheckout"
    );
  }
})
    .catch((err) => {
      console.error(err);
      setError("Error consultando pago");
    })
    .finally(() => {
      setLoading(false);
    });

}, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
        <h1 className="text-3xl font-black">
          Confirmando pago...
        </h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">
            Error
          </h1>

          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
        <h1 className="text-3xl font-black">
          Orden no encontrada
        </h1>
      </main>
    );
  }

  if (order.paymentStatus === "PAID") {
  return (
    <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-7xl mb-6">✅</div>

        <h1 className="text-5xl font-black text-green-400">
          Pago aprobado
        </h1>

        <p className="mt-4 text-white/60">
          Gracias por comprar en Rivecor Store
        </p>

        <p className="mt-2 text-yellow-400">
          Pedido: {order.code}
        </p>

        <Link
  to={`/pedido/${order.code}`}
  className="
    inline-block
    mt-8
    bg-yellow-400
    text-black
    font-black
    px-8
    py-4
    rounded-2xl
  "
>
  Ver mi pedido
</Link>
      </div>
    </main>
  );
}

  if (order.paymentStatus === "REJECTED") {
    return (
      <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-7xl mb-6">❌</div>

          <h1 className="text-5xl font-black text-red-500">
            Pago rechazado
          </h1>

          <p className="mt-4 text-white/60">
            Tu transacción no pudo completarse
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070A0F] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-7xl mb-6">⏳</div>

        <h1 className="text-5xl font-black text-yellow-400">
          Pago pendiente
        </h1>

        <p className="mt-4 text-white/60">
          Estamos esperando confirmación de Getnet
        </p>
      </div>
    </main>
  );
}
