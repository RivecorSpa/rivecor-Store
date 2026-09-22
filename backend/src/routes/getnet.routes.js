const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const {
  sendEmail,
  buildBaseEmail,
} = require("../services/notificationService");

const router = express.Router();


// =======================================
// 🔐 AUTENTICACIÓN GETNET
// =======================================

function getAuth() {
  const nonce = crypto.randomBytes(16);
  const seed = new Date().toISOString();

  const tranKey = crypto
    .createHash("sha256")
    .update(
      Buffer.concat([
        nonce,
        Buffer.from(seed),
        Buffer.from(process.env.GETNET_SECRET),
      ])
    )
    .digest("base64");

  return {
    login: process.env.GETNET_LOGIN,
    tranKey,
    nonce: nonce.toString("base64"),
    seed,
  };
}


// =======================================
// 🔎 CONSULTAR ESTADO GETNET
// =======================================

async function getSessionStatus(requestId) {
  const response = await axios.post(
    `${process.env.GETNET_URL}/api/session/${requestId}`,
    {
      auth: getAuth(),
    }
  );

  return response.data;
}


// =======================================
// 📧 GENERAR CORREO DE COMPRA CONFIRMADA
// =======================================

function buildPurchaseConfirmationEmail(order) {
  const trackingUrl =
    `https://tienda.rivecor.com/seguimiento?pedido=${encodeURIComponent(
      order.code
    )}`;

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      trackingUrl
    )}`;

  const productsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding:12px 8px;
              border-bottom:1px solid #5b6372;
              color:#ffffff;
            "
          >
            ${item.name}
          </td>

          <td
            style="
              padding:12px 8px;
              text-align:center;
              border-bottom:1px solid #5b6372;
              color:#c1b782;
            "
          >
            ${item.quantity}
          </td>

          <td
            style="
              padding:12px 8px;
              text-align:right;
              border-bottom:1px solid #5b6372;
              color:#f9dd6f;
            "
          >
            $${Number(item.total).toLocaleString("es-CL")}
          </td>
        </tr>
      `
    )
    .join("");

  return buildBaseEmail(`
    <div style="text-align:center;">

      <div
        style="
          width:70px;
          height:70px;
          margin:0 auto 20px;
          border-radius:50%;
          background:#f9dd6f;
          color:#000000;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:38px;
          font-weight:bold;
        "
      >
        ✓
      </div>

      <h2
        style="
          margin:0;
          color:#f9dd6f;
          font-size:28px;
        "
      >
        ¡Compra confirmada!
      </h2>

      <p
        style="
          margin-top:12px;
          color:#c1b782;
          font-size:16px;
          line-height:1.6;
        "
      >
        Hola ${order.customer.name},
        <br />
        tu pago fue aprobado correctamente.
      </p>

    </div>


    <div
      style="
        margin-top:30px;
        padding:20px;
        background:#0b0d10;
        border:1px solid #5b6372;
        border-radius:15px;
      "
    >

      <p
        style="
          margin:0 0 8px;
          color:#c1b782;
          font-size:13px;
        "
      >
        NÚMERO DE PEDIDO
      </p>

      <p
        style="
          margin:0;
          color:#f9dd6f;
          font-size:24px;
          font-weight:bold;
        "
      >
        ${order.code}
      </p>

      <p
        style="
          margin:15px 0 0;
          color:#ffffff;
        "
      >
        Estado:
        <strong style="color:#f9dd6f;">
          PAGADO
        </strong>
      </p>

    </div>


    <div style="margin-top:30px;">

      <h3
        style="
          color:#ffffff;
          font-size:20px;
          margin-bottom:15px;
        "
      >
        Resumen de tu compra
      </h3>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="
          border-collapse:collapse;
          font-size:14px;
        "
      >

        <thead>

          <tr>

            <th
              style="
                padding:10px 8px;
                text-align:left;
                color:#c1b782;
                border-bottom:1px solid #5b6372;
              "
            >
              Producto
            </th>

            <th
              style="
                padding:10px 8px;
                text-align:center;
                color:#c1b782;
                border-bottom:1px solid #5b6372;
              "
            >
              Cant.
            </th>

            <th
              style="
                padding:10px 8px;
                text-align:right;
                color:#c1b782;
                border-bottom:1px solid #5b6372;
              "
            >
              Total
            </th>

          </tr>

        </thead>

        <tbody>
          ${productsHtml}
        </tbody>

      </table>

    </div>


    <div
      style="
        margin-top:25px;
        padding:20px;
        background:#0b0d10;
        border-radius:15px;
      "
    >

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
        "
      >

        <span
          style="
            color:#ffffff;
            font-size:18px;
            font-weight:bold;
          "
        >
          TOTAL
        </span>

        <span
          style="
            color:#f9dd6f;
            font-size:26px;
            font-weight:bold;
          "
        >
          $${Number(order.total).toLocaleString("es-CL")}
        </span>

      </div>

    </div>


    <div
      style="
        margin-top:35px;
        text-align:center;
        padding:25px;
        border:1px solid #5b6372;
        border-radius:15px;
        background:#0b0d10;
      "
    >

      <p
        style="
          margin:0 0 18px;
          color:#ffffff;
          font-weight:bold;
          font-size:18px;
        "
      >
        Consulta el estado de tu pedido
      </p>

      <img
        src="${qrUrl}"
        alt="QR seguimiento del pedido"
        width="220"
        height="220"
        style="
          display:block;
          margin:0 auto 20px;
          background:#ffffff;
          padding:8px;
          border-radius:10px;
        "
      />

      <a
        href="${trackingUrl}"
        style="
          display:inline-block;
          padding:14px 24px;
          background:#f9dd6f;
          color:#000000;
          text-decoration:none;
          border-radius:10px;
          font-weight:bold;
        "
      >
        VER MI PEDIDO
      </a>

    </div>


    <p
      style="
        margin-top:30px;
        color:#71705c;
        font-size:12px;
        text-align:center;
        line-height:1.6;
      "
    >
      Guarda este correo para consultar posteriormente
      el estado de tu pedido.
    </p>
  `);
}


// =======================================
// 💳 CREAR SESIÓN GETNET
// =======================================

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
      "ERROR CREANDO SESIÓN GETNET:",
      error?.response?.data || error
    );

    res.status(500).json({
      error: "Error creando sesión Getnet",
    });
  }
});


// =======================================
// 🔎 CONSULTAR ESTADO DEL PAGO
// =======================================

router.get("/status/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        getnetRequestId: String(requestId),
      },

      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Orden no encontrada",
      });
    }


    // Consultar Getnet

    const getnetResponse =
      await getSessionStatus(requestId);

    const getnetStatus =
      getnetResponse?.status?.status;


    // ===================================
    // DETERMINAR ESTADO
    // ===================================

    let paymentStatus = "PENDING";
    let orderStatus = "PENDIENTE";

    if (getnetStatus === "APPROVED") {
      paymentStatus = "PAID";
      orderStatus = "PAGADO";
    }

    if (getnetStatus === "REJECTED") {
      paymentStatus = "REJECTED";
      orderStatus = "RECHAZADO";
    }


    // ===================================
    // HISTORIAL
    // ===================================

    const history = Array.isArray(order.history)
      ? [...order.history]
      : [];

    const alreadyHasStatus =
      history.some(
        (entry) =>
          entry?.status === orderStatus
      );


    if (
      order.status !== orderStatus &&
      !alreadyHasStatus
    ) {
      history.push({
        status: orderStatus,
        date: new Date(),
      });
    }


    // ===================================
    // ACTUALIZAR PEDIDO
    // ===================================

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          paymentStatus,

          status: orderStatus,

          paymentPayload:
            getnetResponse,

          history,
        },

        include: {
          customer: true,
          items: true,
        },
      });


    // ===================================
    // 📧 CORREO DE CONFIRMACIÓN
    // ===================================

    if (
      getnetStatus === "APPROVED"
    ) {

      const emailAlreadySent =
        history.some(
          (entry) =>
            entry?.type ===
              "EMAIL_CONFIRMACION" &&
            entry?.sent === true
        );


      if (!emailAlreadySent) {

        try {

          const emailHtml =
            buildPurchaseConfirmationEmail(
              updatedOrder
            );

          await sendEmail({
            to: updatedOrder.customer.email,

            subject:
              `Compra confirmada - ${updatedOrder.code}`,

            html: emailHtml,
          });


          // Guardamos que el correo fue enviado

          const updatedHistory =
            Array.isArray(
              updatedOrder.history
            )
              ? [
                  ...updatedOrder.history,
                  {
                    type:
                      "EMAIL_CONFIRMACION",
                    sent: true,
                    date: new Date(),
                  },
                ]
              : [
                  {
                    type:
                      "EMAIL_CONFIRMACION",
                    sent: true,
                    date: new Date(),
                  },
                ];


          await prisma.order.update({
            where: {
              id: updatedOrder.id,
            },

            data: {
              history: updatedHistory,
            },
          });


          console.log(
            `📧 Correo de confirmación enviado para ${updatedOrder.code}`
          );

        } catch (emailError) {

          console.error(
            `❌ Error enviando correo para ${updatedOrder.code}:`,
            emailError
          );

          // IMPORTANTE:
          // El pago sigue siendo PAGADO.
          // Si el correo falla, en una próxima
          // consulta podremos intentar enviarlo nuevamente.
        }
      }
    }


    // ===================================
    // RESPUESTA
    // ===================================

    res.json({
      ok: true,

      order: updatedOrder,

      getnet: getnetResponse,
    });

  } catch (error) {

    console.error(
      "ERROR CONSULTANDO GETNET:",
      error?.response?.data || error
    );

    res.status(500).json({
      error: "Error consultando Getnet",
    });
  }
});


module.exports = router;