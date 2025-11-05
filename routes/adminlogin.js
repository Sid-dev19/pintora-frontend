const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const supabase = require('../config/supabase');
require('dotenv').config();

// JWT Secret Key (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * @route POST /chk_admin_login
 * @description Authenticate admin user with email/mobile and password
 * @access Public
 */
router.post('/chk_admin_login', async (req, res) => {
    try {
        const { emailid, password } = req.body;

        // Validate input
        if (!emailid || !password) {
            return res.status(400).json({ 
                message: 'Email/Mobile and password are required', 
                status: false 
            });
        }

        // Check if login is by email or mobile
        const isEmail = emailid.includes('@');
        const query = isEmail 
            ? { emailid: emailid }
            : { mobileno: emailid };

        // Find admin in Supabase
        const { data: admins, error } = await supabase
            .from('admins')
            .select('*')
            .or(`emailid.eq.${emailid},mobileno.eq.${emailid}`);

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                message: 'Database error', 
                status: false 
            });
        }

        // Check if admin exists
        if (!admins || admins.length === 0) {
            return res.status(401).json({ 
                message: 'Invalid Email/Mobile or Password', 
                status: false 
            });
        }

        const admin = admins[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid Email/Mobile or Password', 
                status: false 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                email: admin.emailid,
                role: 'admin'
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' } // Token expires in 24 hours
        );

        // Don't send password in response
        const { password: _, ...adminWithoutPassword } = admin;

        res.status(200).json({ 
            message: 'Login successful', 
            data: {
                ...adminWithoutPassword,
                token: token
            },
            status: true 
        });

    } catch (e) {
        console.error('Login error:', e);
        res.status(500).json({ 
            message: 'Server error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route POST /admin/register
 * @description Register a new admin user
 * @access Protected (should be protected in production)
 */
router.post('/admin/register', async (req, res) => {
    try {
        const { emailid, mobileno, password, name } = req.body;

        // Validate input
        if (!emailid || !mobileno || !password || !name) {
            return res.status(400).json({ 
                message: 'All fields are required', 
                status: false 
            });
        }

        // Check if admin already exists
        const { data: existingAdmins, error: checkError } = await supabase
            .from('admins')
            .select('*')
            .or(`emailid.eq.${emailid},mobileno.eq.${mobileno}`);

        if (checkError) throw checkError;

        if (existingAdmins && existingAdmins.length > 0) {
            return res.status(400).json({ 
                message: 'Admin with this email or mobile already exists', 
                status: false 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const { data, error } = await supabase
            .from('admins')
            .insert([
                { 
                    emailid,
                    mobileno,
                    password: hashedPassword,
                    name,
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        // Generate token
        const token = jwt.sign(
            { 
                id: data[0].id, 
                email: data[0].emailid,
                role: 'admin'
            }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        // Don't send password in response
        const { password: _, ...newAdmin } = data[0];

        res.status(201).json({ 
            message: 'Admin registered successfully', 
            data: {
                ...newAdmin,
                token: token
            },
            status: true 
        });

    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json({ 
            message: 'Server error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * @route GET /admin/me
 * @description Get current admin profile
 * @access Protected
 */
router.get('/admin/me', authenticateToken, async (req, res) => {
    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select('id, name, emailid, mobileno, status, created_at')
            .eq('id', req.user.id)
            .single();

        if (error || !admin) {
            return res.status(404).json({ 
                message: 'Admin not found', 
                status: false 
            });
        }

        res.status(200).json({ 
            message: 'Success', 
            data: admin, 
            status: true 
        });
    } catch (e) {
        console.error('Profile error:', e);
        res.status(500).json({ 
            message: 'Server error: ' + e.message, 
            status: false 
        });
    }
});

/**
 * Middleware to authenticate JWT token
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            message: 'Access token is required', 
            status: false 
        });
    }

    try {
        const user = await new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) reject(err);
                else resolve(user);
            });
        });

        req.user = user;
        next();
    } catch (e) {
        console.error('Token verification failed:', e);
        return res.status(403).json({ 
            message: 'Invalid or expired token', 
            status: false 
        });
    }
}

module.exports = router;