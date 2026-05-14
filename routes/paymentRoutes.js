const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const idempotencyMiddleware = require("../middleware/idempotencyMiddleware");

// Import all controller functions
const { 
    initiatePayment, 
    verifyPayment, 
    getTransactionHistory, 
    simulateWebhook, 
    getPaymentStats,
    fundWallet 
} = require("../controllers/paymentController");

// All payment routes require authentication
router.use(authMiddleware);

// Payment endpoints
router.post("/initiate", idempotencyMiddleware, initiatePayment);
router.get("/verify/:reference", verifyPayment);
router.get("/history", getTransactionHistory);
router.get("/stats", getPaymentStats);
router.post("/webhook", simulateWebhook);
router.post("/fund", fundWallet);  // NEW: Add money to wallet

module.exports = router;