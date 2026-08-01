const multer = require("multer");
const path = require("path");
const fs = require("fs");

const folder = path.join(__dirname, "../../uploads/products");

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, folder);
  },

  filename: (req, file, cb) => {
  const unique =
    Date.now() + "-" + Math.round(Math.random() * 1e9);

  cb(null, unique + path.extname(file.originalname));
},
});

module.exports = multer({ storage });