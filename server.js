const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, '/'))); // Serve frontend files

// Configure MySQL connection
// Note: Replace user and password with your actual MySQL credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // update this to your mysql username
    password: 'root', // update this to your mysql password
    database: 'course_portal'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ', err.message);
        console.error('Make sure MySQL is running and credentials in server.js are correct.');
        return;
    }
    console.log('Successfully connected to MySQL database.');
});

// --- API ENDPOINTS ---

// 1. User Signup
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const checkQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ error: 'Email already registered' });

        // Insert new user
        const insertQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(insertQuery, [name, email, password], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to register user' });

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: result.insertId, name, email }
            });
        });
    });
});

// 2. User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT id, name, email FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Return user data
        res.status(200).json({
            message: 'Login successful',
            user: results[0]
        });
    });
});

// 3. Enroll in a Course
app.post('/api/enroll', (req, res) => {
    const { userId, courseName, phone } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Check if already enrolled in this specific course
    const checkQuery = "SELECT * FROM enrollments WHERE user_id = ? AND course_name = ?";
    db.query(checkQuery, [userId, courseName], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0) return res.status(400).json({ error: 'You are already enrolled in this course' });

        const insertQuery = "INSERT INTO enrollments (user_id, course_name, phone, date) VALUES (?, ?, ?, ?)";
        db.query(insertQuery, [userId, courseName, phone, date], (err, result) => {
            if (err) return res.status(500).json({ error: 'Failed to enroll' });
            res.status(201).json({ message: 'Enrolled successfully' });
        });
    });
});

// 4. Get User Enrollments
app.get('/api/enrollments/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT e.course_name, e.phone, e.date, u.name as student_name 
        FROM enrollments e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.status(200).json({ enrollments: results });
    });
});

// Fallback to serve index.html for any other frontend routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
