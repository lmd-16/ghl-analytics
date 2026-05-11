require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const app = express();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const port = 3000;

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'ghl_analytics'
    
});
app.get('/', (req, res) => {
    res.send('Analytics API is running. Go to /api/business');
});
app.get('/api/business', (req, res) => {
    db.query('SELECT id, bus_name, email, created_at FROM business', (err, results) => {
    if(err) return res.status(500).json({error: err.message});
    res.json(results);
    });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


