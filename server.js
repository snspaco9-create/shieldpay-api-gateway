const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple test route first
app.get('/api/test', (req, res) => {
    res.json({ message: 'ShieldPay API is working!' });
});

// Products route (temporary mock)
app.get('/api/products', (req, res) => {
    res.json([
        { id: 1, name: 'Test Product', price: 1000 },
        { id: 2, name: 'Another Product', price: 2000 }
    ]);
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