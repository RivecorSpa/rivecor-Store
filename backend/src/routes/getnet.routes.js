const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

function getAuth() {
  const nonce = crypto.randomBytes(16);
  const seed = new Date().toISOString();

  const tranKey = crypto
    .createHash("sha256")
    .update(Buffer.concat([
      nonce,
      Buffer.from(seed),
      Buffer.from(process.env.GETNET_SECRET)
    ]))
    .digest("base64");

  return {
    login: process.env.GETNET_LOGIN,
    tranKey,
    nonce: nonce.toString("base64"),
    seed,
  };
}
async function getSessionStatus(requestId) {
  const response = await axios.post(
    `${process.env.GETNET_URL}/api/session/${requestId}`,
    {
      auth: getAuth(),
    }
  );

  return response.data;
}

router.post("/create", async (req, res) => {
  try {
    const {
      orderCode,
      amount,
      customerName,
      customerEmail,
    } = req.body;

    const response = await axios.post(
      `${process.env.GETNET_URL}/api/session`,
      {
        auth: getAuth(),

        locale: "es_CL",

        buyer: {
          name: customerName,
          email: customerEmail,
        },

        payment: {
          reference: orderCode,
          description: `Pedido ${orderCode}`,

          amount: {
            currency: "CLP",
            total: amount,
          },
        },

        expiration: new Date(
          Date.now() + 15 * 60 * 1000
        ).toISOString(),

        returnUrl:
          `${process.env.FRONTEND_URL}/pago/resultado`,

        ipAddress: "127.0.0.1",

        userAgent: "Rivecor Store",
      }
    );
    const getnetData = response.data;
    await prisma.order.update({
  where: {
    code: orderCode,
  },
  data: {
    reference: orderCode,
    getnetRequestId: String(
      getnetData.requestId
    ),
    getnetProcessUrl:
      getnetData.processUrl,
  },
});

    res.json(response.data);
  } catch (error) {
    console.error(
      error?.response?.data || error
    );

    res.status(500).json({
      error: "Error creando sesión Getnet",
    });
  }
});

router.get("/status/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        getnetRequestId: String(requestId),
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada",
      });
    }

    const getnetResponse =
      await getSessionStatus(requestId);

    const status =
      getnetResponse?.status?.status;

    let paymentStatus = "PENDING";
    let orderStatus = "PENDIENTE";

    if (status === "APPROVED") {
      paymentStatus = "PAID";
      orderStatus = "PAGADO";
    }

    if (status === "REJECTED") {
      paymentStatus = "REJECTED";
      orderStatus = "RECHAZADO";
    }

    const history = order.history || [];

history.push({
  status: orderStatus,
  date: new Date(),
});

const updatedOrder =
  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      paymentStatus,
      status: orderStatus,
      paymentPayload: getnetResponse,
      history,
    },
  });

    res.json({
      ok: true,
      order: updatedOrder,
      getnet: getnetResponse,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error consultando Getnet",
    });
  }
});

module.exports = router;
