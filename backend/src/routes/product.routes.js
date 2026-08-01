const router = require("express").Router();
const multer = require("multer");
const upload = require("../middlewares/uploadProductImage");

const {
  importExcel,
  getProducts,
  getFilters,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/product.controller");

const excelUpload = multer({
  dest: "uploads/",
});

router.get("/", getProducts);
router.get("/filters", getFilters);
router.get("/:id", getProductById);

router.post(
  "/import-excel",
  excelUpload.single("file"),
  importExcel
);

router.put("/:id", updateProduct);

router.post(
  "/:id/image",
  upload.single("image"),
  uploadImage
);

router.delete("/:id", deleteProduct);

module.exports = router;