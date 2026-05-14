const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate user-friendly UID (e.g., SP123456)
function generateUID() {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `SP${num}`;
}

// Register user
exports.register = async (req, res) => {
    try {
        const { email, password, full_name, phone_number, transaction_pin } = req.body;

        // Validate required fields
        if (!email || !password || !full_name || !transaction_pin) {
            return res.status(400).json({ 
                msg: "Missing required fields: email, password, full_name, transaction_pin" 
            });
        }

        if (transaction_pin.length < 4 || transaction_pin.length > 6) {
            return res.status(400).json({ msg: "Transaction PIN must be 4-6 digits" });
        }

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .single();

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }

        // Hash password and PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPin = await bcrypt.hash(transaction_pin, salt);

        // Generate unique UID
        let uid = generateUID();
        let uidExists = true;
        while (uidExists) {
            const { data: existing } = await supabase
                .from("users")
                .select("uid")
                .eq("uid", uid)
                .single();
            if (!existing) {
                uidExists = false;
            } else {
                uid = generateUID();
            }
        }

        // Insert user
        const { data: newUser, error: insertError } = await supabase
            .from("users")
            .insert([{ 
                email, 
                password: hashedPassword,
                full_name,
                phone_number: phone_number || null,
                transaction_pin: hashedPin,
                uid,
                balance: 0
            }])
            .select()
            .single();

        if (insertError) {
            console.error("Supabase insert error:", insertError);
            return res.status(500).json({ msg: "Database error" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, uid: newUser.uid },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ 
            msg: "User created successfully", 
            token,
            user: {
                uid: newUser.uid,
                full_name: newUser.full_name,
                email: newUser.email
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password required" });
        }

        // Find user
        const { data: user, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, uid: user.uid },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ 
            msg: "Login successful", 
            token,
            user: {
                uid: user.uid,
                full_name: user.full_name,
                email: user.email,
                balance: user.balance
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};