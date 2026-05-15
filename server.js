const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// SIMPLE CORS - Allow all origins (temporary fix)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

app.use(express.json());

// Import your routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transferRoutes = require('./routes/transferRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transfer', transferRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'ShieldPay API is working!' });
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'ShieldPay API is running' });
});

// Export for Vercel
module.exports = app;

// Local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}