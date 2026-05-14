const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");

// Generate random transaction reference
function generateReference() {
    return `TRF_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

// ENDPOINT 1: Send money to another user
exports.sendMoney = async (req, res) => {
    try {
        const { recipient_uid, amount, pin } = req.body;
        const senderId = req.user.id;

        // Validate input
        if (!recipient_uid || !amount || !pin) {
            return res.status(400).json({ msg: "Missing required fields: recipient_uid, amount, pin" });
        }

        if (amount <= 0) {
            return res.status(400).json({ msg: "Amount must be greater than 0" });
        }

        // Get sender info
        const { data: sender, error: senderError } = await supabase
            .from('users')
            .select('balance, transaction_pin, full_name, email')
            .eq('id', senderId)
            .single();

        if (senderError || !sender) {
            return res.status(404).json({ msg: "Sender not found" });
        }

        // Verify PIN
        const pinValid = await bcrypt.compare(pin, sender.transaction_pin);
        if (!pinValid) {
            return res.status(401).json({ msg: "Invalid transaction PIN" });
        }

        // Check balance
        if (sender.balance < amount) {
            return res.status(400).json({ msg: "Insufficient balance" });
        }

        // Find recipient by UID
        const { data: recipient, error: recipientError } = await supabase
            .from('users')
            .select('id, balance, full_name, email')
            .eq('uid', recipient_uid)
            .single();

        if (recipientError || !recipient) {
            return res.status(404).json({ msg: "Recipient not found. Check the UID." });
        }

        // Don't allow sending to yourself
        if (recipient.id === senderId) {
            return res.status(400).json({ msg: "You cannot send money to yourself" });
        }

        const reference = generateReference();

        // Deduct from sender
        const { error: deductError } = await supabase
            .from('users')
            .update({ balance: sender.balance - amount })
            .eq('id', senderId);

        if (deductError) {
            return res.status(500).json({ msg: "Failed to deduct from sender" });
        }

        // Add to recipient
        const { error: addError } = await supabase
            .from('users')
            .update({ balance: recipient.balance + amount })
            .eq('id', recipient.id);

        if (addError) {
            // Rollback sender deduction if this fails
            await supabase.from('users').update({ balance: sender.balance }).eq('id', senderId);
            return res.status(500).json({ msg: "Failed to add to recipient" });
        }

        // Record transaction with sender/recipient names for both parties
        // Transaction for sender (debit)
        const { error: transactionError1 } = await supabase
            .from('transactions')
            .insert([{
                reference,
                amount,
                user_id: senderId,
                sender_id: senderId,
                recipient_id: recipient.id,
                sender_name: sender.full_name,
                recipient_name: recipient.full_name,
                type: 'transfer',
                status: 'success',
                customer_name: `To: ${recipient.full_name}`,
                customer_email: recipient.email,
                created_at: new Date()
            }]);

        if (transactionError1) {
            console.error("Transaction logging failed for sender:", transactionError1);
        }

        // Transaction for recipient (credit)
        const { error: transactionError2 } = await supabase
            .from('transactions')
            .insert([{
                reference,
                amount,
                user_id: recipient.id,
                sender_id: senderId,
                recipient_id: recipient.id,
                sender_name: sender.full_name,
                recipient_name: recipient.full_name,
                type: 'transfer',
                status: 'success',
                customer_name: `From: ${sender.full_name}`,
                customer_email: sender.email,
                created_at: new Date()
            }]);

        if (transactionError2) {
            console.error("Transaction logging failed for recipient:", transactionError2);
        }

        // Get new balance
        const { data: newBalanceData } = await supabase
            .from('users')
            .select('balance')
            .eq('id', senderId)
            .single();

        res.json({
            msg: "✅ Transfer successful!",
            reference,
            amount,
            recipient: recipient.full_name,
            recipient_uid,
            new_balance: newBalanceData.balance
        });

    } catch (err) {
        console.error("Send money error:", err);
        res.status(500).json({ msg: "Transfer failed. Please try again." });
    }
};

// ENDPOINT 2: Get user balance and UID
exports.getBalance = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('balance, uid, full_name, phone_number, email')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.json({
            balance: user.balance,
            uid: user.uid,
            full_name: user.full_name,
            phone_number: user.phone_number,
            email: user.email
        });
    } catch (err) {
        console.error("Get balance error:", err);
        res.status(500).json({ msg: "Failed to fetch balance" });
    }
};

// ENDPOINT 3: Verify transaction PIN
exports.verifyPin = async (req, res) => {
    try {
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ msg: "PIN is required" });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('transaction_pin')
            .eq('id', req.user.id)
            .single();

        if (error || !user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const pinValid = await bcrypt.compare(pin, user.transaction_pin);

        if (!pinValid) {
            return res.status(401).json({ valid: false, msg: "Invalid PIN" });
        }

        res.json({ valid: true });
    } catch (err) {
        console.error("Verify PIN error:", err);
        res.status(500).json({ msg: "Verification failed" });
    }
};

// ENDPOINT 4: Get transaction history with debit/credit differentiation
exports.getTransferHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .or(`user_id.eq.${userId},sender_id.eq.${userId},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ msg: "Failed to fetch transactions" });
        }

        // Enhance transactions with debit/credit info
        const enhancedTransactions = transactions.map(tx => {
            const isCredit = tx.recipient_id === userId;
            const isDebit = tx.sender_id === userId;
            let displayName = tx.customer_name || '-';
            
            if (tx.type === 'transfer') {
                if (isDebit) {
                    displayName = `To: ${tx.recipient_name || 'User'}`;
                } else if (isCredit) {
                    displayName = `From: ${tx.sender_name || 'User'}`;
                }
            }
            
            return {
                ...tx,
                isCredit,
                isDebit,
                displayName
            };
        });

        res.json({
            transactions: enhancedTransactions,
            total: enhancedTransactions.length
        });
    } catch (err) {
        console.error("Get transfer history error:", err);
        res.status(500).json({ msg: "Failed to fetch history" });
    }
};