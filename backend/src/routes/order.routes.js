const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const axios = require("axios"); // opcional (para futuro)

// =======================================
// 🔥 CREAR PEDIDO (POST)
// =======================================
router.post("/", async (req, res) => {
  try {
    const { customer, items, total } = req.body;

    // 🔥 crear cliente
    const newCustomer = await prisma.customer.create({
      data: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      },
    });

    // 🔥 crear pedido
    const order = await prisma.order.create({
      data: {
        code: `RIV-${Date.now()}`,
        customerId: newCustomer.id,
        total,
        subtotal: total,
        status: "PENDIENTE",
        history: [
          {
            status: "PENDIENTE",
            date: new Date(),
          },
        ],

        items: {
          create: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
    });

    res.json({
      ok: true,
      code: order.code,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error creando pedido",
    });
  }
});

// =======================================
// 🔥 OBTENER TODOS LOS PEDIDOS
// =======================================
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
      },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
});

// =======================================
// 🔥 OBTENER POR CÓDIGO (TRACKING)
// =======================================
router.get("/code/:code", async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { code: req.params.code },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error obteniendo pedido",
    });
  }
});

// =======================================
// 🔥 ACTUALIZAR ESTADO + HISTORIAL
// =======================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
    });

    if (!order) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

    let history = order.history || [];

    history.push({
      status,
      date: new Date(),
    });

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        status,
        history,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error actualizando estado",
    });
  }
});

module.exports = router;