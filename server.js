const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const transferRoutes = require("./routes/transferRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const logger = require("./middleware/logger");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(logger);

// Rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transfer", transferRoutes);  // NEW: Send money endpoints

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        msg: "✅ ShieldPay protected route accessed",
        user: req.user
    });
});

app.get("/", (req, res) => {
    res.send("ShieldPay API is running 🔒");
});

const PORT = process.env.PORT || 5000;
module.exports = app;