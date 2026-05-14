const supabase = require("../config/supabase");

// Generate unique payment reference
function generateReference() {
    return `SP_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

// Initiate payment
exports.initiatePayment = async (req, res) => {
    try {
        const { amount, currency = 'NGN', customer_name, customer_email, payment_method = 'card' } = req.body;
        const userId = req.user.id;
        const idempotencyKey = req.idempotencyKey;
        
        // Validate required fields
        if (!amount || !customer_name || !customer_email) {
            return res.status(400).json({ 
                msg: "Missing required fields: amount, customer_name, customer_email" 
            });
        }
        
        if (amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }
        
        // Generate unique reference
        const reference = generateReference();
        
        // Create transaction record
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                reference,
                amount,
                currency,
                customer_name,
                customer_email,
                payment_method,
                idempotency_key: idempotencyKey,
                user_id: userId,
                status: 'pending'
            }])
            .select()
            .single();
        
        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ msg: "Failed to create transaction" });
        }
        
        // Return mock payment link (simulating payment gateway)
        const mockPaymentLink = `https://checkout.shieldpay.com/pay/${reference}`;
        
        res.status(201).json({
            msg: "Payment initiated successfully",
            reference: transaction.reference,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            payment_link: mockPaymentLink,
            instructions: "To complete payment, POST to /api/payments/webhook with {reference, status: 'success'}"
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Verify payment status
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        const userId = req.user.id;
        
        const { data: transaction, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('reference', reference)
            .eq('user_id', userId)
            .single();
        
        if (error || !transaction) {
            return res.status(404).json({ msg: "Transaction not found" });
        }
        
        res.json({
            reference: transaction.reference,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transaction.status,
            customer_name: transaction.customer_name,
            customer_email: transaction.customer_email,
            created_at: transaction.created_at
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;
        
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        
        if (error) {
            return res.status(500).json({ msg: "Failed to fetch transactions" });
        }
        
        // Get total count
        const { count, error: countError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        res.json({
            transactions,
            total: count || 0,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Webhook to simulate payment confirmation (for testing)
exports.simulateWebhook = async (req, res) => {
    try {
        const { reference, status } = req.body;
        
        if (!reference || !status) {
            return res.status(400).json({ msg: "Missing reference or status" });
        }
        
        // Update transaction status
        const { data: transaction, error } = await supabase
            .from('transactions')
            .update({ 
                status: status,
                updated_at: new Date()
            })
            .eq('reference', reference)
            .select()
            .single();
        
        if (error || !transaction) {
            return res.status(404).json({ msg: "Transaction not found" });
        }
        
        res.json({
            msg: `Payment ${status}`,
            reference: transaction.reference,
            status: transaction.status
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Get payment summary/stats
exports.getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { data: stats, error } = await supabase
            .from('transactions')
            .select('status, amount')
            .eq('user_id', userId);
        
        if (error) {
            return res.status(500).json({ msg: "Failed to fetch stats" });
        }
        
        const totalTransactions = stats.length;
        const totalAmount = stats.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const successfulTransactions = stats.filter(t => t.status === 'success').length;
        const pendingTransactions = stats.filter(t => t.status === 'pending').length;
        const failedTransactions = stats.filter(t => t.status === 'failed').length;
        const totalSuccessAmount = stats
            .filter(t => t.status === 'success')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        res.json({
            total_transactions: totalTransactions,
            total_amount: totalAmount,
            total_success_amount: totalSuccessAmount,
            successful: successfulTransactions,
            pending: pendingTransactions,
            failed: failedTransactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Fund wallet (add money to balance)
exports.fundWallet = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ msg: "Valid amount required" });
        }

        // Get current balance
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const newBalance = user.balance + amount;

        // Update balance
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);

        if (updateError) {
            return res.status(500).json({ msg: "Failed to fund wallet" });
        }

        res.json({
            msg: `✅ Wallet funded with ₦${amount}`,
            new_balance: newBalance
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};