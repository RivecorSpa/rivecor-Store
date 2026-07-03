import { useLocation, useNavigate } from "react-router-dom";

const steps = [
  { key: "PENDIENTE", label: "Pedido recibido" },
  { key: "PAGADO", label: "Pago confirmado" },
  { key: "PREPARANDO", label: "Preparando pedido" },
  { key: "ENVIADO", label: "En camino" },
  { key: "ENTREGADO", label: "Entregado" },
];

export default function PedidoCreado() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const order = state?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A0F] text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black">
            Pedido no encontrado
          </h1>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-yellow-400 px-6 py-3 rounded-xl font-bold text-black"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(
    (s) => s.key === order.status
  );

  const phone = "56912345678";

  const message = `Hola, realicé el pedido ${
    order.code
  } por $${Number(order.total).toLocaleString("es-CL")}`;

  return (
    <main className="min-h-screen bg-[#070A0F] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-[#0B0F17] border border-white/10 rounded-3xl p-8">

        <h1 className="text-4xl font-black text-yellow-400 text-center">
          Pedido realizado ✅
        </h1>

        <p className="text-center mt-2 text-white/60">
          Código: {order.code}
        </p>

        <div className="mt-6 text-center">
          <p>Total</p>
          <p className="text-3xl text-yellow-400 font-black">
            ${Number(order.total).toLocaleString("es-CL")}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isDone = index < currentStepIndex;

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isDone
                      ? "bg-yellow-400"
                      : isActive
                      ? "bg-green-400"
                      : "bg-white/20"
                  }`}
                />
                <p
                  className={`font-bold ${
                    isActive
                      ? "text-green-400"
                      : isDone
                      ? "text-yellow-400"
                      : "text-white/40"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-4">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noreferrer"
            className="block w-full text-center bg-green-400 text-black font-black py-4 rounded-2xl"
          >
            Contactar por WhatsApp
          </a>

          <button
            onClick={() => navigate("/")}
            className="w-full border border-white/10 py-4 rounded-2xl font-bold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </main>
  );
}