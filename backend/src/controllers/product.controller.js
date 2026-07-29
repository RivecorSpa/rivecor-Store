const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      width,
      profile,
      rim,
      brand,
      search,
    } = req.query;

    const where = {
      active: true,
    };

    if (category) {
      where.vehicleType = category;
    }

    if (width) {
      where.width = width;
    }

    if (profile) {
      where.profile = profile;
    }

    if (rim) {
      where.rim = String(rim);
    }

    if (brand) {
      where.brand = brand;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          size: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const products = await prisma.product.findMany({
      where,
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
exports.getFilters = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};

    if (category) {
      where.vehicleType = category;
    }

    const widths = await prisma.product.findMany({
      where,
      distinct: ["width"],
      select: { width: true },
      orderBy: { width: "asc" },
    });

    const profiles = await prisma.product.findMany({
      where,
      distinct: ["profile"],
      select: { profile: true },
      orderBy: { profile: "asc" },
    });

    const rims = await prisma.product.findMany({
      where,
      distinct: ["rim"],
      select: { rim: true },
      orderBy: { rim: "asc" },
    });

    res.json({
      widths: widths
  .map(x => x.width)
  .filter(v => v && v.trim() !== ""),

profiles: profiles
  .map(x => x.profile)
  .filter(v => v && v.trim() !== ""),

rims: rims
  .map(x => x.rim)
  .filter(v => v && v.trim() !== ""),
    });

  } catch (err) {
  console.error("ERROR GET FILTERS:");
  console.error(err);

  res.status(500).json({
    error: err.message,
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
  workbook.Sheets[sheetName],
  {
    defval: "",
  }
);

console.log("ROWS:", rows);

    let imported = 0;

    for (const row of rows) {
      console.log("Fila:", row);
      await prisma.product.upsert({
        where: {
          sku: String(row["SKU"]).trim(),
        },
        update: {
          name: row["Nombre"] || "",
  brand: row["Marca"] || "",
  category: row["Categoría"] || "",
  vehicleType: row["Categoría"] || "",
  width: String(row["Ancho"] || ""),
  profile: String(row["Perfil"] || ""),
  rim: String(row["Aro"] || ""),
  size: row["Medida"] || "",
  price: Number(row["Precio"] || 0),
  offerPrice: null,
  stock: Number(row["Stock"] || 0),
  imageUrl: "",
  description: row["Descripción"] || "",
  active: true,
},
        create: {
          sku: String(row["SKU"]).trim(),
  name: row["Nombre"] || "",
  brand: row["Marca"] || "",
  category: row["Categoría"] || "",
  vehicleType: row["Categoría"] || "",
  width: String(row["Ancho"] || ""),
  profile: String(row["Perfil"] || ""),
  rim: String(row["Aro"] || ""),
  size: row["Medida"] || "",
  price: Number(row["Precio"] || 0),
  offerPrice: null,
  stock: Number(row["Stock"] || 0),
  imageUrl: "",
  description: row["Descripción"] || "",
  active: true,
},
      });
      const product =

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
  vehicleType,
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
  vehicleType: category,
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