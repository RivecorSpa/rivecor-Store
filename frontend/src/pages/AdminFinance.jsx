import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const salesByMonth = [
  { month: "Ene", ventas: 3200000 },
  { month: "Feb", ventas: 4100000 },
  { month: "Mar", ventas: 3900000 },
  { month: "Abr", ventas: 5200000 },
  { month: "May", ventas: 6480000 },
  { month: "Jun", ventas: 7100000 },
];

const categoryData = [
  { name: "Camión", value: 48 },
  { name: "Camioneta", value: 27 },
  { name: "SUV", value: 15 },
  { name: "Maquinaria", value: 10 },
];

const ordersData = [
  { day: "Lun", pedidos: 8 },
  { day: "Mar", pedidos: 12 },
  { day: "Mié", pedidos: 9 },
  { day: "Jue", pedidos: 15 },
  { day: "Vie", pedidos: 18 },
  { day: "Sáb", pedidos: 11 },
];

const COLORS = ["#FACC15", "#A3A3A3", "#525252", "#FFFFFF"];
export default function AdminFinance() {
  const [metrics, setMetrics] = useState({
  lowStock: 0,
  pendingOrders: 0,
});
  const navigate = useNavigate();
  useEffect(() => {
  loadMetrics();
}, []);

const loadMetrics = async () => {
  try {
    const res = await fetch("http://localhost:3001/api/dashboard");
    const data = await res.json();

    setMetrics({
      lowStock: data.lowStock,
      pendingOrders: data.pendingOrders,
    });
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
};
  return (
    <div>
      <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-400">
        Finanzas
      </span>

      <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black">Resumen financiero</h1>
      <p className="mt-3 text-white/45">
        Indicadores comerciales, ventas y rendimiento de la tienda.
      </p>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        <Box title="Ingresos totales" value="$12.480.000" subtitle="+18% vs mes anterior" />
        <Box title="Margen estimado" value="$3.120.000" subtitle="25% margen promedio" />
        <Box title="Pedidos pagados" value="34" subtitle="7 pendientes de despacho" />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <ChartCard title="Ventas mensuales" subtitle="Evolución de ingresos por mes">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByMonth}>
              <XAxis dataKey="month" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" tickFormatter={(v) => `$${v / 1000000}M`} />
              <Tooltip
                formatter={(value) => `$${Number(value).toLocaleString("es-CL")}`}
                contentStyle={{
                  background: "#090D12",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
              <Bar dataKey="ventas" fill="#FACC15" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ventas por categoría" subtitle="Distribución del catálogo vendido">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#090D12",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: COLORS[index] }}
                  />
                  <span className="text-white/60">{item.name}</span>
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </ChartCard>
      </section>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">

  <h2 className="text-2xl font-black">
    Centro de control
  </h2>

  <div className="mt-6 space-y-4">

    <QuickAction
      icon="⚠️"
      title="Stock crítico"
      value="3 neumáticos"
      onClick={() => navigate("/admin/catalog?stock=critico")}
    />

    <QuickAction
      icon="📦"
      title="Pedidos pendientes"
      value={`${metrics.pendingOrders} pedidos`}
      onClick={() => navigate("/admin/orders?status=PENDIENTE")}
    />

    <QuickAction
      icon="🚚"
      title="Pedidos"
      value="Ver todos"
      onClick={() => navigate("/admin/orders")}
    />

    <QuickAction
      icon="💰"
      title="Ventas"
      value="Detalle financiero"
      onClick={() => navigate("/admin/finance")}
    />

  </div>

</div>
    </div>
  );
}

function Box({ title, value, subtitle }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7">
      <p className="text-white/45">{title}</p>
      <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-400">{value}</h3>
      <p className="mt-2 text-sm text-white/40">{subtitle}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 sm:p-6 lg:p-7">
      <h2 className="text-xl sm:text-2xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-white/40">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
function QuickAction({ icon, title, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-5 hover:border-yellow-400 hover:bg-white/5 transition"
    >
      <div className="flex items-center gap-4">

        <div className="text-3xl">
          {icon}
        </div>

        <div className="text-left">
          <p className="text-sm text-white/45">
            {title}
          </p>

          <h3 className="font-black">
            {value}
          </h3>
        </div>

      </div>

      <span className="text-yellow-400 text-2xl">
        →
      </span>

    </button>
  );
}