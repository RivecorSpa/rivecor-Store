import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Nueva venta",
      message: "Pedido PED-00025",
      time: "Hace 10 seg",
      route: "/admin/orders/25",
    },
    {
      id: 2,
      type: "warning",
      title: "Stock crítico",
      message: "Michelin X Works HD",
      time: "Hace 2 min",
      route: "/admin/catalog?stock=critico",
    },
    {
      id: 3,
      type: "error",
      title: "Pago rechazado",
      message: "Pedido PED-00019",
      time: "Hace 5 min",
      route: "/admin/orders/19",
    },
    {
      id: 4,
      type: "info",
      title: "Venta incompleta",
      message: "Cliente abandonó el carrito",
      time: "Hace 8 min",
      route: "/admin/orders?status=INCOMPLETA",
    },
  ];

  const color = {
    success: "bg-green-500",
    warning: "bg-yellow-400",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-xl p-2 hover:bg-white/10"
      >
        <Bell size={24} />

        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] rounded-2xl border border-white/10 bg-[#0B0F17] shadow-2xl z-50">

          <div className="border-b border-white/10 p-4">
            <h2 className="text-lg font-black text-white">
              🔔 Notificaciones
            </h2>
          </div>

          <div className="max-h-[500px] overflow-y-auto">

            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  navigate(n.route);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-4 border-b border-white/5 p-4 text-left transition hover:bg-white/5"
              >
                <div
                  className={`mt-2 h-3 w-3 rounded-full ${color[n.type]}`}
                />

                <div className="flex-1">

                  <p className="font-bold text-white">
                    {n.title}
                  </p>

                  <p className="text-sm text-white/60">
                    {n.message}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {n.time}
                  </p>

                </div>

              </button>
            ))}

          </div>

        </div>
      )}
    </div>
  );
}