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
app.post('/api/clients', authenticate, (req,res) =>{
    const {email, phone, client_name} = req.body; 
    const business_id = req.business.id; 
    if(!client_name){
        return res.status(400).json({error: 'Client name is required'});
    }
    db.query('INSERT INTO client(bus_id, client_name, phone, email) VALUES(?,?,?,?)',
        [business_id, client_name, phone, email],
        (err,result) => {
            if(err) {
                return res.status(500).json({error: err.message});
            }
            res.status(201).json({message: 'Client created', client_id: result.insertId});
        }
    );
});

app.get('/api/clients', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    db.query('SELECT * FROM client WHERE bus_id = ? ORDER BY created_at DESC',
        [business_id],
        (err, results)=>{
            if(err){
                return res.status(500).json({error: err.message})
            }
            res.json(results);
        }
    );
});

app.get('/api/clients/:id', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const client_id = req.params.id;

    db.query('SELECT * FROM client WHERE id = ? AND bus_id = ?',
        [client_id, business_id],
        (err, results)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(results.length === 0){
                return res.status(404).json({error: 'Client not found'})
            }
            res.json(results[0]);
        }
    );
});

app.put('/api/clients/:id', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const client_id = req.params.id; 
    const {client_name, phone, email} = req.body;

    db.query('UPDATE client SET client_name = ?, email = ?, phone = ? WHERE id = ? AND bus_id = ?', 
        [client_name, email, phone, client_id, business_id],
        (err, result)=> {
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.affectedRows === 0){
                return res.status(404).json({error: 'Client not found'});
            }
            res.json({message: 'Client updated'});
        }
    );

});

app.delete('/api/clients/:id', authenticate, (req,res)=>{
    const business_id = req.business.id;
    const client_id = req.params.id; 
    db.query('DELETE FROM client WHERE bus_id = ? AND id = ?',
        [business_id, client_id],
        (err, result) =>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.affectedRows === 0){
                return res.status(404).json({error: 'Client not found'});
            }
            res.json({message: 'Client deleted'});
        }
    )
})
app.get('/api/client/:client_id/campaigns', authenticate, (req,res)=> {
    const business_id = req.business.id; 
    const client_id = req.params.client_id; 
    db.query('SELECT * FROM campaign WHERE client_id = ? AND bus_id = ? ORDER BY created_at DESC', 
        [client_id, business_id], 
        (err, result)=>{
            if(err){
                return req.status(500).json({error: err.message});
            }
            res.json(result);
        }
    )
})

app.get('/api/campaign', authenticate, (req, res)=> {
    const business_id = req.business.id; 
    db.query('SELECT * FROM campaign WHERE bus_id = ?',
        [business_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            res.json(result);
        }
    );
});


app.post('/api/campaigns', authenticate, (req, res)=>{
    const business_id = req.business.id; 
    const {client_id, campaign_name, start_date, end_date, } = req.body; 
    if(!campaign_name){
        return res.status(400).json({error: 'Campaign name is required'});
    }
    db.query('INSERT INTO campaign(bus_id, client_id, campaign_name, start_date, end_date) VALUES (?,?,?,?, ?)',
        [business_id, client_id, campaign_name, start_date, end_date],
    (err, result)=>{
        if(err){
            return res.status(500).json({error: err.message})
        }
        res.status(201).json({
            message: 'Campaign created',
            campaign_id: result.insertId
    });
    });
});
api.get('/api/campaigns/:id', authenticate, (req, res)=>{
    const business_id = req.business.id; 
    const campaign_id = req.params.id; 
    db.query('SELECT * FROM campaign WHERE bus_id = ? AND id = ?',
        [business_id, campaign_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.length === 0){
                return res.status(404).json({error: 'Campaign not found'});
            }
            res.json(result[0]);
        }
    );
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


