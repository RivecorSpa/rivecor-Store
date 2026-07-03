const router = require("express").Router();
const multer = require("multer");

const {
  importExcel,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const upload = multer({
  dest: "uploads/",
});

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/import-excel",
  upload.single("file"),
  importExcel
);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
module.exports = router;