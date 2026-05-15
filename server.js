const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();


app.use(cors({
    origin: ['https://shieldpay-frontend.vercel.app', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true
}));
app.use(express.json());


const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const transferRoutes = require('./routes/transferRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/transfer', transferRoutes);


app.get('/api/test', (req, res) => {
    res.json({ message: 'ShieldPay API is working!' });
});


app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'ShieldPay API is running' });
});


module.exports = app;


if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}