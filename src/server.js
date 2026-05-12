require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const app = express();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
const port = 3000;
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
app.post('/api/business', async(req, res) => {
    const {bus_name, email, password} = req.body;
    try{
        const password_hash = await bcrypt.hash(password, saltRounds); 
        db.query('INSERT INTO business(bus_name, email, password_hash) VALUES (?, ?, ?)', 
        [bus_name, email, password_hash],
        (err,result) => {
            if(err) {
                if(err.code === 'ER_DUP_ENTRY'){
                    return res.status(409).json({error: err.message});
                }
                return res.status(500).json({error: err.message});
            }
        res.status(201).json({
            message: 'Business created successfully',
            business_id: result.insertId
        });
    }
);
    }catch(err){
        return res.status(500).json({error: err.message});
    }
});
app.post('/api/login', async(req, res) => {
    const {email, password} = req.body; 
    if(!email || !password){
        return res.status(400).json({error: 'Email and password required'});
    }
    db.query('SELECT id, bus_name, email, password_hash FROM business WHERE email = ?',
        [email],
        async(err, results) => {
            if(err) {
                return res.status(500).json({error: err.message});
            }
            if(results.length === 0){
                return res.status(401).json({error: 'Invalid credentials'});
            }
            const business = results[0];
            const valid = await bcrypt.compare(password, business.password_hash);
            if(!valid){
                return res.status(401).json({error: 'Invalid credentials'});
            }
            const token = jwt.sign(
                {id: business.id, email: business.email},
                process.env.JWT_SECRET, 
                {expiresIn:'24h'}
            );
            res.json({
                message: 'Login successful',
                token,
                business:{
                    id: business.id,
                    name: business.bus_name, 
                    email: business.email
                }
            });
        }
    );

});
function authenticate(req, res, next){
    const authHeader = req.headers.authorization; 
    if(!authHeader){
        return res.status(401).json({error:'No token provided'});
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.business = decoded;
        next();
    }catch(error){
        return res.status(401).json({error: 'Invalid or expired token'});
    }
}

app.get('/api/business/profile', authenticate, (req,res) =>{
    const business_id = req.business.id; 
    db.query('SELECT id, bus_name, email FROM business WHERE id = ?', 
        [business_id], 
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message})
            }
            if(result.length === 0){
                return res.status(404).json({error:'Business not found'});
            }
            res.json(result[0]);
        }
    )

})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


