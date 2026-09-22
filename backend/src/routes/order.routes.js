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
    const { code } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: "Correo electrónico requerido",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        code: code.trim(),
        customer: {
          email: {
            equals: email.trim(),
            mode: "insensitive",
          },
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "No encontramos un pedido con esos datos",
      });
    }

    res.json(order);
  } catch (error) {
    console.error("ERROR TRACKING PEDIDO:", error);

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


// =======================================
// 📧 PRUEBA DE CORREO
// =======================================

router.post("/test-email", async (req, res) => {
  try {
    const {
      sendEmail,
      buildBaseEmail,
      verifyEmailConnection,
    } = require("../services/notificationService");

    await verifyEmailConnection();

    const emailDestino = req.body.email;

    if (!emailDestino) {
      return res.status(400).json({
        error: "Debes indicar un correo de destino",
      });
    }

    const html = buildBaseEmail(`
      <h2
        style="
          color:#f9dd6f;
          margin-top:0;
        "
      >
        Prueba de correo
      </h2>

      <p
        style="
          color:#ffffff;
          font-size:16px;
          line-height:1.6;
        "
      >
        Este correo fue enviado correctamente desde
        <strong>Rivecor Store</strong>.
      </p>

      <div
        style="
          margin-top:25px;
          padding:20px;
          background:#0b0d10;
          border:1px solid #5b6372;
          border-radius:15px;
        "
      >
        <p
          style="
            margin:0;
            color:#c1b782;
          "
        >
          SMTP Hostinger conectado correctamente.
        </p>
      </div>
    `);

    await sendEmail({
      to: emailDestino,
      subject: "Prueba de correo - Rivecor Store",
      html,
    });

    res.json({
      ok: true,
      message: "Correo de prueba enviado correctamente",
    });

  } catch (error) {
    console.error("ERROR TEST EMAIL:", error);

    res.status(500).json({
      ok: false,
      error: error.message || "Error enviando correo",
    });
  }
});

module.exports = router;


module.exports = router;