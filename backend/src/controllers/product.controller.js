const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo productos",
    });
  }
};

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Archivo requerido",
      });
    }

    const workbook = XLSX.readFile(req.file.path);

    const sheetName = workbook.SheetNames[0];

    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName]
    );

    let imported = 0;

    for (const row of rows) {
      await prisma.product.upsert({
        where: {
          sku: String(row.sku),
        },
        update: {
          name: row.name || "",
          brand: row.brand || "",
          category: row.category || "",
          rim: String(row.rim || ""),
          size: row.size || "",
          price: Number(row.price || 0),
          offerPrice: row.offerPrice
            ? Number(row.offerPrice)
            : null,
          stock: Number(row.stock || 0),
          imageUrl: row.imageUrl || "",
          description: row.description || "",
          active: true,
        },
        create: {
          sku: String(row.sku),
          name: row.name || "",
          brand: row.brand || "",
          category: row.category || "",
          rim: String(row.rim || ""),
          size: row.size || "",
          price: Number(row.price || 0),
          offerPrice: row.offerPrice
            ? Number(row.offerPrice)
            : null,
          stock: Number(row.stock || 0),
          imageUrl: row.imageUrl || "",
          description: row.description || "",
          active: true,
        },
      });

      imported++;
    }

    res.json({
      ok: true,
      imported,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error importando Excel",
    });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      brand,
      category,
      rim,
      size,
      price,
      offerPrice,
      stock,
      imageUrl,
      description,
      active,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        brand,
        category,
        rim: String(rim || ""),
        size,
        price: Number(price || 0),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        stock: Number(stock || 0),
        imageUrl,
        description,
        active: active === undefined ? true : Boolean(active),
      },
    });

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error actualizando producto",
    });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      ok: true,
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error eliminando producto",
    });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Producto no encontrado",
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error obteniendo producto",
    });
  }
};