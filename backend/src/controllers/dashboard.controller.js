const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const products = await prisma.product.findMany();

    // KPIs
    const totalSales = orders.reduce(
      (acc, order) => acc + Number(order.total || 0),
      0
    );

    const pendingOrders = orders.filter(
      (o) => o.status === "PENDIENTE"
    ).length;

    const lowStock = products.filter(
      (p) => p.stock <= 5
    ).length;

    // Ventas por día
    const salesByDay = {};

    orders.forEach((order) => {
      const day = new Date(order.createdAt)
        .toISOString()
        .split("T")[0];

      salesByDay[day] =
        (salesByDay[day] || 0) +
        Number(order.total || 0);
    });

    const chartData = Object.entries(
      salesByDay
    ).map(([date, total]) => ({
      date,
      total,
    }));

    // Estados
    const statusData = [
      {
        name: "Pendiente",
        value: orders.filter(
          (o) => o.status === "PENDIENTE"
        ).length,
      },
      {
        name: "Pagado",
        value: orders.filter(
          (o) => o.status === "PAGADO"
        ).length,
      },
      {
        name: "Preparando",
        value: orders.filter(
          (o) => o.status === "PREPARANDO"
        ).length,
      },
      {
        name: "Enviado",
        value: orders.filter(
          (o) => o.status === "ENVIADO"
        ).length,
      },
      {
        name: "Entregado",
        value: orders.filter(
          (o) => o.status === "ENTREGADO"
        ).length,
      },
    ];

    // PRODUCTOS MÁS VENDIDOS CON FOTO
    const soldProducts = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!soldProducts[item.name]) {
          soldProducts[item.name] = {
            name: item.name,
            sold: 0,
            imageUrl: "",
            brand: item.brand || "",
            size: item.size || "",
          };
        }

        soldProducts[item.name].sold +=
          item.quantity;
      });
    });

    Object.values(soldProducts).forEach(
      (product) => {
        const dbProduct = products.find(
          (p) => p.name === product.name
        );

        if (dbProduct) {
          product.imageUrl =
            dbProduct.imageUrl || "";

          product.brand =
            dbProduct.brand || "";

          product.size =
            dbProduct.size || "";
        }
      }
    );

    const topProducts = Object.values(
      soldProducts
    )
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Últimos pedidos
    const latestOrders = orders
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        code: order.code,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
      }));

    res.json({
      totalSales,
      totalOrders: orders.length,
      pendingOrders,
      lowStock,
      chartData,
      statusData,
      topProducts,
      latestOrders,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error dashboard",
    });
  }
};