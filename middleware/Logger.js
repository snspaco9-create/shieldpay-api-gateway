const supabase = require("../config/supabase");

const logger = async (req, res, next) => {
    const start = Date.now();
    
    // Store original send function
    const originalSend = res.json;
    
    // Override json method to capture response
    res.json = function(data) {
        const responseTime = Date.now() - start;
        
        // Log to Supabase
        const logEntry = {
            endpoint: req.originalUrl || req.url,
            method: req.method,
            user_email: req.user?.email || null,
            ip_address: req.ip || req.connection.remoteAddress,
            status_code: res.statusCode,
            response_time_ms: responseTime
        };
        
        supabase.from("api_logs").insert([logEntry])
            .then(() => console.log(`📝 Logged: ${req.method} ${req.url} (${responseTime}ms)`))
            .catch(err => console.error("Logging failed:", err.message));
        
        // Call original send function
        originalSend.call(this, data);
    };
    
    next();
};

module.exports = logger;