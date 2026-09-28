const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();

const {
  sendEmail,
  buildBaseEmail,
} = require("../services/notificationService");

/* =========================================================
   GETNET AUTH
========================================================= */

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

/* =========================================================
   CONSULTAR ESTADO GETNET
========================================================= */

async function getSessionStatus(requestId) {
  const response = await axios.post(
    `${process.env.GETNET_URL}/api/session/${requestId}`,
    {
      auth: getAuth(),
    }
  );

  return response.data;
}

/* =========================================================
   EMAIL CONFIRMACIÓN DE COMPRA
========================================================= */

function buildPurchaseConfirmationEmail(order) {
  const trackingUrl =
    `https://tienda.rivecor.com/seguimiento?pedido=${encodeURIComponent(
      order.code
    )}`;

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      trackingUrl
    )}`;

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2e36;color:#ffffff;">
            ${item.name}
            <br />
            <span style="font-size:13px;color:#8f96a3;">
              Cantidad: ${item.quantity}
            </span>
          </td>

          <td style="padding:12px 0;border-bottom:1px solid #2a2e36;color:#f9dd6f;text-align:right;font-weight:bold;">
            $${Number(item.total || 0).toLocaleString("es-CL")}
          </td>
        </tr>
      `
    )
    .join("");

  return buildBaseEmail(`
    <h2 style="color:#f9dd6f;margin-top:0;">
      ¡Compra confirmada!
    </h2>

    <p style="color:#ffffff;font-size:16px;line-height:1.6;">
      Hola <strong>${order.customer?.name || ""}</strong>,
    </p>

    <p style="color:#c1b782;font-size:15px;line-height:1.6;">
      Hemos recibido correctamente tu pago.
      Tu pedido ya está registrado en Rivecor Store.
    </p>

    <div style="
      margin-top:25px;
      padding:20px;
      background:#0b0d10;
      border:1px solid #5b6372;
      border-radius:15px;
    ">

      <p style="margin:0 0 8px;color:#8f96a3;font-size:13px;">
        NÚMERO DE PEDIDO
      </p>

      <p style="margin:0;color:#f9dd6f;font-size:22px;font-weight:bold;">
        ${order.code}
      </p>

      <p style="margin:18px 0 0;color:#8f96a3;font-size:13px;">
        ESTADO
      </p>

      <p style="margin:5px 0 0;color:#ffffff;font-weight:bold;">
        PAGADO
      </p>

    </div>

    <h3 style="
      margin-top:30px;
      color:#ffffff;
      font-size:18px;
    ">
      Resumen de tu compra
    </h3>

    <table style="
      width:100%;
      border-collapse:collapse;
      margin-top:10px;
    ">
      ${itemsHtml}
    </table>

    <div style="
      margin-top:20px;
      padding-top:18px;
      border-top:1px solid #5b6372;
    ">
      <p style="
        margin:0;
        text-align:right;
        color:#ffffff;
        font-size:22px;
        font-weight:bold;
      ">
        Total:
        <span style="color:#f9dd6f;">
          $${Number(order.total || 0).toLocaleString("es-CL")}
        </span>
      </p>
    </div>

    <div style="
      margin-top:30px;
      text-align:center;
      padding:25px;
      background:#0b0d10;
      border:1px solid #5b6372;
      border-radius:15px;
    ">

      <p style="
        margin:0 0 18px;
        color:#ffffff;
        font-weight:bold;
      ">
        Escanea el QR para consultar tu pedido
      </p>

      <img
        src="${qrUrl}"
        alt="QR seguimiento pedido"
        width="220"
        height="220"
        style="
          display:block;
          margin:0 auto 20px;
          background:#ffffff;
          padding:10px;
          border-radius:10px;
        "
      />

      <a
        href="${trackingUrl}"
        style="
          display:inline-block;
          padding:14px 24px;
          background:#f9dd6f;
          color:#070809;
          text-decoration:none;
          border-radius:10px;
          font-weight:bold;
        "
      >
        VER MI PEDIDO
      </a>

    </div>
  `);
}

/* =========================================================
   CREAR SESIÓN GETNET
========================================================= */

router.post("/create", async (req, res) => {
  try {
    const {
      orderCode,
      amount,
      customerName,
      customerEmail,
    } = req.body;

    if (!orderCode) {
      return res.status(400).json({
        error: "Código de pedido requerido",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        error: "Monto de pago inválido",
      });
    }

    if (!customerEmail) {
      return res.status(400).json({
        error: "Correo del cliente requerido",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        code: orderCode,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: "Pedido no encontrado",
      });
    }

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
            total: Number(amount),
          },

          allowPartial: false,
        },

        expiration: new Date(
          Date.now() + 15 * 60 * 1000
        ).toISOString(),

        returnUrl:
          `${process.env.FRONTEND_URL}/pago/resultado`,

        ipAddress:
          req.headers["x-forwarded-for"]
            ?.split(",")[0]
            ?.trim() ||
          req.socket.remoteAddress ||
          "127.0.0.1",

        userAgent:
          req.headers["user-agent"] ||
          "Rivecor Store",
      }
    );

    const getnetData = response.data;

    await prisma.order.update({
      where: {
        code: orderCode,
      },

      data: {
        reference: orderCode,

        getnetRequestId:
          String(getnetData.requestId),

        getnetProcessUrl:
          getnetData.processUrl,
      },
    });

    res.json(getnetData);
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

/* =========================================================
   CONSULTAR ESTADO GETNET
========================================================= */

router.get(
  "/status/:requestId",
  async (req, res) => {
    try {
      const { requestId } = req.params;

      /* -----------------------------------------------
         BUSCAR PEDIDO
      ------------------------------------------------ */

      const order =
        await prisma.order.findFirst({
          where: {
            getnetRequestId:
              String(requestId),
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

      /* -----------------------------------------------
         CONSULTAR GETNET
      ------------------------------------------------ */

      const getnetResponse =
        await getSessionStatus(requestId);

      const getnetStatus =
        getnetResponse?.status?.status;

      console.log(
        "GETNET STATUS:",
        getnetStatus
      );

      /* -----------------------------------------------
         ESTADO INICIAL
      ------------------------------------------------ */

      let paymentStatus =
        order.paymentStatus || "PENDING";

      let orderStatus =
        order.status || "PENDIENTE";

      /* -----------------------------------------------
         APROBADO
      ------------------------------------------------ */

      if (getnetStatus === "APPROVED") {
        paymentStatus = "PAID";
        orderStatus = "PAGADO";
      }

      /* -----------------------------------------------
         RECHAZADO
      ------------------------------------------------ */

      else if (
        getnetStatus === "REJECTED"
      ) {
        /*
          MUY IMPORTANTE:

          Si ya está pagado, nunca
          retrocedemos el pedido.
        */

        if (
          order.paymentStatus !== "PAID"
        ) {
          paymentStatus = "REJECTED";
          orderStatus = "RECHAZADO";
        }
      }

      /* -----------------------------------------------
         PENDING / OTRO
      ------------------------------------------------ */

      else {
        /*
          Si ya estaba pagado, mantenemos
          PAGADO aunque Getnet responda
          temporalmente otro estado.
        */

        if (
          order.paymentStatus === "PAID"
        ) {
          paymentStatus = "PAID";
          orderStatus = "PAGADO";
        } else {
          paymentStatus = "PENDING";
          orderStatus = "PENDIENTE";
        }
      }

      /* -----------------------------------------------
         HISTORIAL
      ------------------------------------------------ */

      const history = Array.isArray(
        order.history
      )
        ? [...order.history]
        : [];

      const alreadyHasStatus =
        history.some(
          (entry) =>
            entry?.status ===
            orderStatus
        );

      if (!alreadyHasStatus) {
        history.push({
          status: orderStatus,
          date: new Date(),
        });
      }

      /* -----------------------------------------------
         TRANSACCIÓN DE PAGO + STOCK
      ------------------------------------------------ */

      let updatedOrder;

      if (
        getnetStatus === "APPROVED" &&
        !order.stockProcessed
      ) {
        updatedOrder =
          await prisma.$transaction(
            async (tx) => {
              /*
               * Volvemos a consultar el pedido
               * dentro de la transacción para evitar
               * trabajar con información antigua.
               */

              const currentOrder =
                await tx.order.findUnique({
                  where: {
                    id: order.id,
                  },

                  include: {
                    customer: true,
                    items: true,
                  },
                });

              if (!currentOrder) {
                throw new Error(
                  "Pedido no encontrado dentro de la transacción"
                );
              }

              /*
               * Otra consulta pudo haber procesado
               * el stock antes.
               */

              if (
                currentOrder.stockProcessed
              ) {
                return tx.order.update({
                  where: {
                    id: currentOrder.id,
                  },

                  data: {
                    paymentStatus: "PAID",
                    status: "PAGADO",
                    paymentPayload:
                      getnetResponse,
                    history,
                  },

                  include: {
                    customer: true,
                    items: true,
                  },
                });
              }

              /*
               * DESCONTAR STOCK
               */

              for (const item of currentOrder.items) {
                const quantity =
                  Number(item.quantity);

                const result =
                  await tx.product.updateMany({
                    where: {
                      id: item.productId,
                      stock: {
                        gte: quantity,
                      },
                    },

                    data: {
                      stock: {
                        decrement:
                          quantity,
                      },
                    },
                  });

                /*
                 * Si no se actualizó ninguna fila,
                 * significa que no hay stock suficiente.
                 */

                if (result.count !== 1) {
                  throw new Error(
                    `Stock insuficiente para el producto ${item.name}`
                  );
                }
              }

              /*
               * MARCAR STOCK COMO PROCESADO
               */

              return tx.order.update({
                where: {
                  id: currentOrder.id,
                },

                data: {
                  paymentStatus: "PAID",

                  status: "PAGADO",

                  paymentPayload:
                    getnetResponse,

                  history,

                  stockProcessed: true,
                },

                include: {
                  customer: true,
                  items: true,
                },
              });
            }
          );
      } else {
        /* ---------------------------------------------
           ACTUALIZACIÓN NORMAL
        --------------------------------------------- */

        updatedOrder =
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
      }

      /* -----------------------------------------------
         ENVIAR CORREO SOLO SI:

         - Pago aprobado
         - Correo todavía no enviado
      ------------------------------------------------ */

      if (
        getnetStatus === "APPROVED"
      ) {
        const currentHistory =
          Array.isArray(
            updatedOrder.history
          )
            ? updatedOrder.history
            : [];

        const emailAlreadySent =
          currentHistory.some(
            (entry) =>
              entry?.type ===
                "EMAIL_CONFIRMACION" &&
              entry?.sent === true
          );

        if (
          !emailAlreadySent &&
          updatedOrder.customer?.email
        ) {
          try {
            const html =
              buildPurchaseConfirmationEmail(
                updatedOrder
              );

            await sendEmail({
              to:
                updatedOrder.customer
                  .email,

              subject:
                `Compra confirmada - ${updatedOrder.code}`,

              html,
            });

            /* -----------------------------------------
               REGISTRAR EMAIL EN HISTORIAL
            ----------------------------------------- */

            const emailHistory =
              Array.isArray(
                updatedOrder.history
              )
                ? [
                    ...updatedOrder.history,
                  ]
                : [];

            emailHistory.push({
              type:
                "EMAIL_CONFIRMACION",

              sent: true,

              date: new Date(),
            });

            updatedOrder =
              await prisma.order.update({
                where: {
                  id: updatedOrder.id,
                },

                data: {
                  history:
                    emailHistory,
                },

                include: {
                  customer: true,
                  items: true,
                },
              });

            console.log(
              "📧 CORREO DE CONFIRMACIÓN ENVIADO:",
              updatedOrder.customer.email
            );
          } catch (emailError) {
            /*
             * MUY IMPORTANTE:
             *
             * Si falla el correo,
             * NO hacemos fallar el pago.
             *
             * El pedido sigue PAGADO.
             */

            console.error(
              "ERROR ENVIANDO CORREO DE CONFIRMACIÓN:",
              emailError
            );
          }
        }
      }

      /* -----------------------------------------------
         RESPUESTA
      ------------------------------------------------ */

      res.json({
        ok: true,

        order: updatedOrder,

        getnet: getnetResponse,
      });
    } catch (error) {
      console.error(
        "ERROR CONSULTANDO GETNET:",
        error?.response?.data ||
          error?.message ||
          error
      );

      res.status(500).json({
        error:
          error.message ||
          "Error consultando Getnet",
      });
    }
  }
);

module.exports = router;