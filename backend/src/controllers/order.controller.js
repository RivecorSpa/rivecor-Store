const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function generateCode() {
  return `RV-${Date.now()}`;
}

exports.createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      paymentMethod,
      deliveryMethod,
      address,
      subtotal,
      servicesTotal,
      shipping,
      total,
    } = req.body;

    if (!customer || !items?.length) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const order = await prisma.$transaction(async (tx) => {
      const savedCustomer = await tx.customer.create({
        data: {
          name: customer.name,
          rut: customer.rut || "",
          email: customer.email,
          phone: customer.phone || "",
          address: address || "",
        },
      });

      for (const item of items) {
        if (item.id) {
          const product = await tx.product.findUnique({
            where: { id: Number(item.id) },
          });

          if (!product) {
            throw new Error(`Producto no encontrado: ${item.name}`);
          }

          if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}`);
          }

          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: product.stock - Number(item.quantity),
            },
          });
        }
      }

      return await tx.order.create({
        data: {
          code: generateCode(),
          customerId: savedCustomer.id,
          status: "PENDIENTE",
          paymentMethod,
          deliveryMethod,
          address,
          subtotal: Number(subtotal || 0),
          servicesTotal: Number(servicesTotal || 0),
          shipping: Number(shipping || 0),
          total: Number(total || 0),
          items: {
            create: items.map((item) => ({
              productId: item.id ? Number(item.id) : null,
              name: item.name,
              brand: item.brand || "",
              size: item.size || "",
              quantity: Number(item.quantity || 1),
              unitPrice: Number(item.price || 0),
              total: Number(item.price || 0) * Number(item.quantity || 1),
              services: item.services || [],
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Error creando pedido",
    });
  }
};

exports.getOrders = async (req, res) => {
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
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo pedido" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: {
        customer: true,
        items: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error actualizando estado" });
  }
};