const supabase = require("../config/supabase");

const idempotencyMiddleware = async (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];
    
    if (!idempotencyKey) {
        return res.status(400).json({ 
            msg: "Missing idempotency-key header. This prevents double charges." 
        });
    }
    
    try {
        // Check if this key was already used
        const { data: existing, error } = await supabase
            .from('transactions')
            .select('reference, status, amount')
            .eq('idempotency_key', idempotencyKey)
            .single();
        
        if (existing) {
            // Return previous result instead of processing again
            return res.status(200).json({
                msg: "Previous transaction result (idempotent)",
                reference: existing.reference,
                status: existing.status,
                amount: existing.amount,
                idempotent: true
            });
        }
        
        // Store key in request for later use
        req.idempotencyKey = idempotencyKey;
        next();
    } catch (err) {
        // No existing transaction, continue
        next();
    }
};

module.exports = idempotencyMiddleware;