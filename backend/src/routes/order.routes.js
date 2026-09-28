const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const SERVICE_PRICES = {
  balanceo: 10000,
  alineacion: 15000,
  instalacion: 20000,
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function calculateServices(item) {
  const services = item?.services || {};

  let total = 0;

  if (services.balanceo) {
    total += SERVICE_PRICES.balanceo;
  }

  if (services.alineacion) {
    total += SERVICE_PRICES.alineacion;
  }

  if (services.instalacion) {
    total += SERVICE_PRICES.instalacion;
  }

  return total;
}

/**
 * CREAR PEDIDO
 */
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      subtotal,
      servicesTotal,
      shipping,
      deliveryMethod,
      total,
    } = req.body;

    // ----------------------------------------
    // VALIDACIONES
    // ----------------------------------------

    if (!customer?.name) {
      return res.status(400).json({
        error: "Nombre del cliente requerido",
      });
    }

    if (!customer?.email) {
      return res.status(400).json({
        error: "Correo del cliente requerido",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "El pedido debe contener productos",
      });
    }

    // ----------------------------------------
    // VALIDAR PRODUCTOS Y STOCK
    // ----------------------------------------

    const productIds = items.map((item) =>
      Number(item.productId)
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        error:
          "Uno o más productos ya no están disponibles",
      });
    }

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    // ----------------------------------------
    // CALCULAR TOTALES DESDE BACKEND
    // ----------------------------------------

    let calculatedSubtotal = 0;
    let calculatedServicesTotal = 0;

    const orderItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
          error: `Cantidad inválida para ${item.name}`,
        });
      }

      const product = productMap.get(productId);

      if (!product) {
        return res.status(400).json({
          error: `Producto no encontrado: ${item.name}`,
        });
      }

      if (quantity > Number(product.stock)) {
        return res.status(400).json({
          error: `Stock insuficiente para ${product.name}. Stock disponible: ${product.stock}`,
        });
      }

      const unitPrice = Number(
        product.offerPrice ?? product.price
      );

      const productTotal =
        unitPrice * quantity;

      const servicesTotalForItem =
        calculateServices(item);

      calculatedSubtotal += productTotal;
      calculatedServicesTotal +=
        servicesTotalForItem;

      orderItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand || null,
        size: product.size || null,
        quantity,
        unitPrice,
        total: productTotal,
        services: item.services || {},
      });
    }

    // ----------------------------------------
    // ENVÍO
    // ----------------------------------------

    const normalizedDeliveryMethod =
      deliveryMethod === "envio"
        ? "envio"
        : "retiro";

    const calculatedShipping =
      normalizedDeliveryMethod === "envio"
        ? 12990
        : 0;

    const calculatedTotal =
      calculatedSubtotal +
      calculatedServicesTotal +
      calculatedShipping;

    // ----------------------------------------
    // VALIDAR TOTAL RECIBIDO
    // ----------------------------------------

    const receivedTotal = Number(total);

    if (
      !Number.isFinite(receivedTotal) ||
      Math.round(receivedTotal) !==
        Math.round(calculatedTotal)
    ) {
      return res.status(400).json({
        error: "El total del pedido no es válido",
      });
    }

    // ----------------------------------------
    // CREAR CLIENTE + PEDIDO
    // ----------------------------------------

    const result = await prisma.$transaction(
      async (tx) => {
        const newCustomer =
          await tx.customer.create({
            data: {
              name: String(customer.name).trim(),
              email: normalizeEmail(customer.email),
              phone: customer.phone
                ? String(customer.phone).trim()
                : null,
              address: customer.address
                ? String(customer.address).trim()
                : null,
            },
          });

        const order =
          await tx.order.create({
            data: {
              code: `RIV-${Date.now()}-${Math.floor(
                Math.random() * 1000
              )}`,

              customerId: newCustomer.id,

              status: "PENDIENTE",

              paymentMethod: "GETNET",

              deliveryMethod:
                normalizedDeliveryMethod,

              address:
                customer.address
                  ? String(customer.address).trim()
                  : null,

              subtotal: calculatedSubtotal,

              servicesTotal:
                calculatedServicesTotal,

              shipping:
                calculatedShipping,

              total: calculatedTotal,

              paymentProvider: "GETNET",

              paymentStatus: "PENDING",

              history: [
                {
                  status: "PENDIENTE",
                  date: new Date(),
                },
              ],

              items: {
                create: orderItems,
              },
            },

            include: {
              customer: true,
              items: true,
            },
          });

        return order;
      }
    );

    console.log(
      "✅ PEDIDO CREADO:",
      result.code
    );

    res.json({
      ok: true,
      code: result.code,
      order: result,
    });
  } catch (error) {
    console.error(
      "ERROR CREANDO PEDIDO:",
      error
    );

    res.status(500).json({
      error: "Error creando pedido",
    });
  }
});

/**
 * OBTENER TODOS LOS PEDIDOS
 * Admin
 */
router.get("/", async (req, res) => {
  try {
    const orders =
      await prisma.order.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          customer: true,
          items: true,
        },
      });

    res.json(orders);
  } catch (error) {
    console.error(
      "ERROR OBTENIENDO PEDIDOS:",
      error
    );

    res.status(500).json({
      error: "Error obteniendo pedidos",
    });
  }
});

/**
 * SEGUIMIENTO DE PEDIDO
 *
 * Requiere:
 * código + correo
 */
router.get(
  "/code/:code",
  async (req, res) => {
    try {
      const { code } = req.params;
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          error:
            "Correo electrónico requerido",
        });
      }

      const order =
        await prisma.order.findFirst({
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
          error:
            "No encontramos un pedido con esos datos",
        });
      }

      res.json(order);
    } catch (error) {
      console.error(
        "ERROR TRACKING PEDIDO:",
        error
      );

      res.status(500).json({
        error:
          "Error obteniendo pedido",
      });
    }
  }
);

/**
 * CAMBIAR ESTADO
 * Admin
 */
router.patch(
  "/:id/status",
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "PENDIENTE",
        "PAGADO",
        "PREPARANDO",
        "ENVIADO",
        "ENTREGADO",
        "RECHAZADO",
        "CANCELADO",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          error: "Estado no válido",
        });
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: Number(id),
          },
        });

      if (!order) {
        return res.status(404).json({
          error: "Pedido no encontrado",
        });
      }

      // ----------------------------------------
      // EVITAR RETROCESO DE PAGO
      // ----------------------------------------

      if (
        order.paymentStatus === "PAID" &&
        (status === "PENDIENTE" ||
          status === "RECHAZADO")
      ) {
        return res.status(400).json({
          error:
            "Un pedido pagado no puede volver a estado pendiente o rechazado",
        });
      }

      const history = Array.isArray(
        order.history
      )
        ? [...order.history]
        : [];

      const alreadyExists =
        history.some(
          (entry) =>
            entry?.status === status
        );

      if (!alreadyExists) {
        history.push({
          status,
          date: new Date(),
        });
      }

      const updated =
        await prisma.order.update({
          where: {
            id: Number(id),
          },

          data: {
            status,
            history,
          },

          include: {
            customer: true,
            items: true,
          },
        });

      res.json(updated);
    } catch (error) {
      console.error(
        "ERROR ACTUALIZANDO ESTADO:",
        error
      );

      res.status(500).json({
        error:
          "Error actualizando estado",
      });
    }
  }
);

/**
 * TEST EMAIL
 */
router.post(
  "/test-email",
  async (req, res) => {
    try {
      const {
        sendEmail,
        buildBaseEmail,
        verifyEmailConnection,
      } = require("../services/notificationService");

      await verifyEmailConnection();

      const emailDestino =
        req.body.email;

      if (!emailDestino) {
        return res.status(400).json({
          error:
            "Debes indicar un correo de destino",
        });
      }

      const html =
        buildBaseEmail(`
          <h2 style="color:#f9dd6f;margin-top:0;">
            Prueba de correo
          </h2>

          <p style="color:#ffffff;font-size:16px;line-height:1.6;">
            Este correo fue enviado correctamente desde
            <strong>Rivecor Store</strong>.
          </p>

          <div style="margin-top:25px;padding:20px;background:#0b0d10;border:1px solid #5b6372;border-radius:15px;">
            <p style="margin:0;color:#c1b782;">
              SMTP Hostinger conectado correctamente.
            </p>
          </div>
        `);

      await sendEmail({
        to: emailDestino,
        subject:
          "Prueba de correo - Rivecor Store",
        html,
      });

      res.json({
        ok: true,
        message:
          "Correo de prueba enviado correctamente",
      });
    } catch (error) {
      console.error(
        "ERROR TEST EMAIL:",
        error
      );

      res.status(500).json({
        ok: false,
        error:
          error.message ||
          "Error enviando correo",
      });
    }
  }
);

module.exports = router;