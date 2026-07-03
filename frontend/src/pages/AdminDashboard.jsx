import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
    chartData: [],
    statusData: [],
    topProducts: [],
    latestOrders: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(
        "http://localhost:3001/api/dashboard"
      );

      const data = await res.json();

      setMetrics(data);
    } catch (error) {
      console.error("Error dashboard:", error);
    }
  };

  const COLORS = [
    "#facc15",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
    "#ef4444",
  ];
  const totalEstados =
  (metrics.statusData || []).reduce(
    (acc, item) => acc + item.value,
    0
  );

  return (
    <div className="p-3 sm:p-6 text-white">
      <h1 className="mb-6 text-3xl sm:text-4xl font-black">
        Dashboard
      </h1>

      {/* KPI */}
      <div className="mb-8 grid gap-4 grid-cols-2 xl:grid-cols-4">
        <Card
  icon="💰"
  title="Ventas"
  value={`$${Number(metrics.totalSales || 0).toLocaleString("es-CL")}`}
/>

<Card
  icon="📦"
  title="Pedidos"
  value={metrics.totalOrders || 0}
/>

<Card
  icon="🕒"
  title="Pendientes"
  value={metrics.pendingOrders || 0}
/>

<Card
  icon="⚠️"
  title="Stock Bajo"
  value={metrics.lowStock || 0}
/>
      </div>

      {/* GRÁFICOS */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="mb-4 text-xl font-black">
            Ventas por día
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.chartData || []}>
              <Line
                type="monotone"
  dataKey="total"
  stroke="#facc15"
  strokeWidth={3}
  isAnimationActive={true}
  animationDuration={1200}
              />
              <Tooltip
  content={({ active, payload }) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div
        className="rounded-3xl border border-yellow-400/30 bg-[#09090b] px-4 py-3 shadow-xl"
      >
        <p className="text-lg font-bold text-yellow-400">
          Ventas : $
          {Number(
            payload[0].value
          ).toLocaleString("es-CL")}
        </p>
      </div>
    );
  }}
/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
  <h2 className="mb-4 text-xl font-black">
    Estado de pedidos
  </h2>

  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie
         data={metrics.statusData || []}
  dataKey="value"
  nameKey="name"
  outerRadius={80}
  innerRadius={45}
  paddingAngle={3}
  isAnimationActive
  animationDuration={1200}
      >
        {(metrics.statusData || []).map(
          (_, index) => (
            <Cell
              key={index}
              fill={
                COLORS[index % COLORS.length]
              }
            />
          )
        )}
      </Pie>

      <Tooltip
        contentStyle={{
          backgroundColor: "#09090b",
          border:
            "1px solid rgba(250,204,21,.3)",
          borderRadius: "16px",
          color: "#fff",
        }}
      />
    </PieChart>
  </ResponsiveContainer>

  <div className="mt-4 space-y-3">
    {(metrics.statusData || []).map(
      (item, index) => (
        <div key={item.name}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{item.name}</span>

            <span className="font-bold text-yellow-400">
              {item.value}
            </span>
          </div>

          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${
  totalEstados
    ? (item.value / totalEstados) * 100
    : 0
}%`,
                backgroundColor:
                  COLORS[
                    index %
                      COLORS.length
                  ],
              }}
            />
          </div>
        </div>
      )
    )}
  </div>
</div>
      </div>

      {/* TOP PRODUCTOS */}
<div className="mb-8 rounded-3xl border border-white/10 bg-black/40 p-6">
  <div className="mb-5 flex items-center justify-between">
    <h2 className="text-2xl font-black">
      Productos más vendidos
    </h2>

    <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
      Top 5
    </span>
  </div>

  <div className="space-y-4">
    {(metrics.topProducts || []).map(
      (product, index) => (
        <div
          key={product.name}
          className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 hover:bg-white/[0.05] transition"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 rounded-2xl object-cover"
              />

              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-black">
                {index + 1}
              </div>
            </div>

            <div>
              <p className="font-bold">
                {product.name}
              </p>

              <p className="text-sm text-white/50">
                {product.brand}
              </p>

              <p className="text-xs text-white/35">
                {product.size}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-black text-yellow-400">
              {product.sold}
            </p>

            <p className="text-xs text-white/50">
              vendidos
            </p>
          </div>
        </div>
      )
    )}
  </div>
</div>

      {/* ÚLTIMOS PEDIDOS */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <h2 className="mb-4 text-xl font-black">
          Últimos pedidos
        </h2>

        <div className="space-y-3">
          {(metrics.latestOrders || []).map(
            (order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between rounded-xl bg-white/5 p-4"
              >
                <div>
                  <p className="font-black">
                    {order.code}
                  </p>

                  <div className="mt-2">

<span
className={`px-3 py-1 rounded-full text-xs font-bold ${
order.status==="ENTREGADO"
? "bg-green-500/20 text-green-400"
: order.status==="PENDIENTE"
? "bg-yellow-500/20 text-yellow-400"
: order.status==="PAGADO"
? "bg-blue-500/20 text-blue-400"
: "bg-white/10 text-white"
}`}
>

{order.status}

</span>

</div>
                </div>

                <div className="text-right">
                  <p className="font-black text-yellow-400">
                    $
                    {Number(
                      order.total || 0
                    ).toLocaleString("es-CL")}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-yellow-400/40
hover:-translate-y-1
duration-300">

    <div className="flex items-center gap-3">

        <div className="text-3xl">
            {icon}
        </div>

        <div>

            <p className="text-sm text-white/50">
                {title}
            </p>

            <h3 className="text-3xl font-black mt-1">
                {value}
            </h3>

        </div>

    </div>

</div>
  );
}