require("dotenv").config();

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth.routes");
const productRoutes = require("./src/routes/product.routes");
const orderRoutes = require("./src/routes/order.routes");
const paymentsRoutes = require("./src/routes/payments.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const getnetRoutes = require("./src/routes/getnet.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/getnet", getnetRoutes);

app.get("/", (req, res) => {
  res.json({
    ok: true,
    project: "Rivecor Store API",
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
