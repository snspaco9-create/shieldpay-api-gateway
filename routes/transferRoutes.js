const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { sendMoney, getBalance, verifyPin } = require("../controllers/transferController");

// All routes require authentication
router.use(authMiddleware);

// Send money to another user
router.post("/send", sendMoney);

// Get my balance and UID
router.get("/balance", getBalance);

// Verify transaction PIN before sending
router.post("/verify-pin", verifyPin);

module.exports = router;