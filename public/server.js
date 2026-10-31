const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Use require('mysql2') if using MySQL
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Test Connection
pool.connect()
    .then(() => console.log(' Connected to PostgreSQL Database'))
    .catch(err => console.error(' Database Connection Error:', err));

// Route: Fetch Student Result
app.get('/api/results', async (req, res) => {
    const { name, className, term, session } = req.query;
    try {
        const query = `
            SELECT s.full_name, c.class_name, s.arm, r.subject, r.ca1, r.ca2, r.practical, r.exam, r.total 
            FROM students s
            JOIN classes c ON s.class_id = c.id
            JOIN results r ON s.id = r.student_id
            JOIN academic_terms t ON r.term_id = t.id
            WHERE LOWER(s.full_name) = LOWER($1) 
              AND c.class_name = $2 
              AND t.term = $3 
              AND t.session = $4
        `;
        const result = await pool.query(query, [name, className, term, session]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});