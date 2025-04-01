const {db} = require('../config/db')
const bcrypt = require('bcrypt')
const {generateAccessToken} = require('../utils/auth.utils')

// Registration Controller
async function registerController(req, res) {
    const { email, password , role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required for registration!"
        });
    }

    try {
        // Check if the email or user already exists
        const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        await db.execute("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, hashedPassword, role]);

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
}


async function loginController(req, res) {
    const { email, password } = req.body;

    // console.log(req.body, 7);

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required to log in!",
        });
    }

    try {
        // Check if user exists
        const [results] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const user = results[0];
        // console.log(user, 25); 

        // Check for hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = generateAccessToken({ id: user.id, email: user.email });

        // Insert Logins details into the Logins table
        await db.execute("INSERT INTO logins (user_id, email) VALUES (?, ?)", [user.id, user.email]);

        res.json({
            success: true,
            message: "Login successful",
            token,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error", error });
    }
}

module.exports = {loginController , registerController}