const router = require("express").Router();

const {
  PrismaClient,
} = require("@prisma/client");

const prisma = new PrismaClient();

const {
  createGetnetSession,
  getGetnetSession,
} = require("../services/getnet.service");

function generateCode() {
  return `RIV-${Date.now()}`;
}

function generateReference() {
  return `REF-${Date.now()}`;
}

router.post(
  "/getnet/create",
  async (req, res) => {
    try {
      const {
        customer,
        items,
        subtotal,
        shipping,
        total,
        address,
      } = req.body;

      if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          error: "Carrito vacío",
        });
      }

      let customerRecord =
        await prisma.customer.findFirst({
          where: {
            email: customer.email,
          },
        });

      if (!customerRecord) {
        customerRecord =
          await prisma.customer.create({
            data: {
              name: customer.name,
              email: customer.email,
              phone:
                customer.phone,
              address:
                customer.address,
            },
          });
      }

      const order =
        await prisma.order.create({
          data: {
            code: generateCode(),

            reference:
              generateReference(),

            customerId:
              customerRecord.id,

            status: "PENDIENTE",

            paymentMethod:
              "GETNET",

            deliveryMethod:
              "DELIVERY",

            address,

            subtotal:
              Number(subtotal),

            shipping:
              Number(shipping || 0),

            total:
              Number(total),

            paymentStatus:
              "PENDING",

            paymentProvider:
              "GETNET",

            paymentPayload:
              {
                items,
              },

            items: {
              create: items.map(
                (item) => ({
                  productId:
                    item.id || null,

                  name:
                    item.name,

                  brand:
                    item.brand,

                  size:
                    item.size,

                  quantity:
                    Number(
                      item.quantity
                    ),

                  unitPrice:
                    Number(
                      item.price
                    ),

                  total:
                    Number(
                      item.price
                    ) *
                    Number(
                      item.quantity
                    ),

                  services:
                    item.services ||
                    [],
                })
              ),
            },
          },

          include: {
            customer: true,
            items: true,
          },
        });

      const getnetResponse =
        await createGetnetSession(
          order,
          req
        );

      if (
        !getnetResponse?.requestId ||
        !getnetResponse?.processUrl
      ) {
        return res.status(500).json({
          error:
            "Getnet no devolvió URL",
          detail:
            getnetResponse,
        });
      }

      await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          getnetRequestId:
            String(
              getnetResponse.requestId
            ),

          getnetProcessUrl:
            getnetResponse.processUrl,
        },
      });

      return res.json({
        ok: true,

        paymentUrl:
          getnetResponse.processUrl,

        requestId:
          getnetResponse.requestId,

        reference:
          order.reference,
      });
    } catch (error) {
      console.error(
        "GETNET CREATE ERROR:",
        error.response?.data ||
          error
      );

      return res.status(500).json({
        error:
          "Error creando pago Getnet",

        detail:
          error.response?.data ||
          error.message,
      });
    }
  }
);

router.get(
  "/getnet/status/:reference",
  async (req, res) => {
    try {
      const { reference } =
        req.params;

      const order =
        await prisma.order.findFirst({
          where: {
            reference,
          },
        });

      if (!order) {
        return res.status(404).json({
          error:
            "Orden no encontrada",
        });
      }

      if (
        !order.getnetRequestId
      ) {
        return res.status(400).json({
          error:
            "Orden sin requestId",
        });
      }

      const response =
        await getGetnetSession(
          order.getnetRequestId
        );

      const status =
        response?.status?.status;

      let paymentStatus =
        "PENDING";

      if (
        status ===
        "APPROVED"
      ) {
        paymentStatus =
          "PAID";
      }

      if (
        status ===
        "REJECTED"
      ) {
        paymentStatus =
          "REJECTED";
      }

      const updated =
        await prisma.order.update({
          where: {
            id: order.id,
          },

          data: {
            paymentStatus,

            status:
              paymentStatus ===
              "PAID"
                ? "PAGADO"
                : "PENDIENTE",

            paymentPayload:
              response,
          },
        });

      return res.json({
        ok: true,
        order: updated,
        getnet: response,
      });
    } catch (error) {
      console.error(
        "GETNET STATUS ERROR:",
        error.response?.data ||
          error
      );

      return res.status(500).json({
        error:
          "Error consultando pago",
      });
    }
  }
);

module.exports = router;