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
            res.status(201).json(result[0]);
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
//update client
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
            res.status(201).json({message: 'Client updated'});
        }
    );

});
//delete client 
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
            res.status(201).json({message: 'Client deleted'});
        }
    );
});
//get all campaigns for a client 
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
//get all campaigns for a business
app.get('/api/campaigns', authenticate, (req, res)=> {
    const business_id = req.business.id; 
    db.query('SELECT * FROM campaign WHERE bus_id = ?',
        [business_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.length === 0){
                return res.status(404).json({error: 'No campaigns found'});
            }
            res.json(result);
        }
    );
});

//create a campaign for a business 
app.post('/api/campaigns', authenticate, (req, res)=>{
    const business_id = req.business.id; 
    const {client_id, campaign_name, start_date, end_date, daily_budget } = req.body; 
    if(!campaign_name){
        return res.status(400).json({error: 'Campaign name is required'});
    }
    db.query('INSERT INTO campaign(bus_id, client_id, campaign_name, start_date, end_date, daily_budget) VALUES (?,?,?,?,?,?)',
        [business_id, client_id, campaign_name, start_date, end_date, daily_budget],
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
//find a campaign 
app.get('/api/campaigns/:id', authenticate, (req, res)=>{
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
//delete a campaign 
app.delete('/api/campaigns/:id', authenticate, (req, res) => {
    const business_id = req.business.id; 
    const campaign_id = req.params.id; 
    db.query('DELETE FROM campaign WHERE bus_id = ? AND id = ?', 
        [business_id, campaign_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.affectedRows === 0){
                return res.status(404).json({error: 'Campaign not found'});
            }
            res.status(201).json({message: 'Campaign deleted'});
        }
    );
});
//update a campaign 
app.put('/api/campaigns/:id', authenticate, (req, res) => {
    const business_id = req.business.id; 
    const campaign_id = req.params.id; 
    const {campaign_name, start_date, end_date, status, daily_budget } = req.body; 

    let updates = []; 
    let values = []; 

    if(campaign_name !== undefined){
        updates.push('campaign_name = ?'); 
        values.push(campaign_name);
    }

    if (start_date != undefined){
        updates.push('start_date = ?');
        values.push(start_date);
    }

    if(end_date != undefined){
        updates.push('end_date = ?');
        values.push(end_date);
    }
    if(daily_budget != undefined){
        updates.push('daily_budget = ?');
        values.push(daily_budget);
    }
    if(status != undefined){
        updates.push('status = ?');
        values.push(status);
    }
    if(updates.length === 0){
        return res.status(500).json({error: 'No fields to updates'});
    }
    values.push(campaign_id, business_id);

    db.query(`UPDATE campaign SET ${updates.join(',')} WHERE id = ? AND bus_id = ?`,
        values, 
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.affectedRows === 0){
                return res.status(404).json({error: 'Campaign not found'});
            }
            res.status(201).json({message: 'Campaign updated'});
        }
    );

});
// //add spend entry
// app.post('/api/spend-entries', authenticate, (req, res)=>{
//     const business_id = req.business.id; 
//     const {campaign_id, spend_date, amount} = req.body; 
//     if(!campaign_id || !spend_date || !amount){
//         return res.status(400).json({error:'Missing required fields: campaign ID, spend date, amount'});
//     }
//     db.query(
//         'SELECT id FROM campaign WHERE id = ? AND bus_id = ?', 
//         [campaign_id, business_id],
//         (err, result)=>{
//             if(err){
//                 return res.status(500).json({error: err.message});
//             }
//             if(result.length === 0){
//                 return res.status(404).json({error: 'Campaign not found'});
//             }
//             db.query('INSERT INTO spend_entries(campaign_id,spend_date, amount) VALUES(?,?,?)',
//                 [campaign_id, spend_date, amount || 'manual'],
//                 (err, result)=>{
//                     if(err){
//                         return res.status(500).json({error: err.message});
//                     }
//                     res.status(201).json({message: 'Spend entry added', id: result.insertId});
//                     }
//                 );

//         }
//     )
// });


// //read entries for a campaign
// app.get('/api/spend-entries', authenticate, (req,res)=>{
//     const business_id = req.business.id; 
//     const campaign_id = req.params.id; 
//     db.query(`SELECT s.* FROM spend_entries s
//             JOIN campaign c ON c.id = s.campaign_id
//             WHERE c.id = ? AND c.bus_id = ? 
//             ORDER BY s.spend_date DESC`,
//             [campaign_id, business_id],
//             (err, result)=>{
//                 if(err){
//                     return res.status(500).json({error: err.message});
//                 }
//             res.json(result);
//         }
//     );
// });

app.post('/api/leads', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const {campaign_id, f_name, l_name, email, phone, ghl_id} = req.body;
    if(!campaign_id || !f_name || !l_name){
        return res.status(400).json({error: 'Missing required fields: campaign ID, first name or last name'});
    }
    db.query('INSERT INTO leads(bus_id, campaign_id, f_name, l_name, email, phone, ghl_id) VALUES(?,?,?,?,?,?,?)',
        [business_id, campaign_id, f_name, l_name, email, phone, ghl_id || null],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            res.status(201).json({message: 'Lead created', lead_id: result.insertId});
        }
    );
});

// get all leads for a campaign
app.get('/api/campaigns/:campaign_id/leads', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const campaign_id = req.params.campaign_id;
    db.query('SELECT id, f_name, l_name, email, phone, ghl_id, lead_status, created_at FROM leads WHERE bus_id = ? AND campaign_id = ? ORDER BY created_at DESC',
        [business_id, campaign_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.length === 0){
                return res.status(404).json({error: 'No leads to show'});
            }
            res.json(result);
        }
    );
});

//update lead
app.put('/api/leads/:id', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const lead_id = req.params.id;
    const {f_name, l_name, email, phone, lead_status, ghl_id} = req.body;
    let updates = [];
    let values = [];

    if(f_name !== undefined){
        updates.push('f_name = ?');
        values.push(f_name);
    }

    if(l_name !== undefined){
        updates.push('l_name = ?');
        values.push(l_name);
    }

    if(email !== undefined){
        updates.push('email = ?');
        values.push(email);
    }
    if(phone !== undefined){
        updates.push('phone = ?');
        values.push(phone);
    }
    if(lead_status !== undefined){
        updates.push('lead_status = ?');
        values.push(lead_status);
    }
    if(ghl_id !== undefined){
        updates.push('ghl_id = ?');
        values.push(ghl_id);
    }
    if(updates.length === 0){
        return res.status(500).json({error: 'No fields to updates'});
    }
    values.push(business_id, lead_id);

    db.query(`UPDATE leads SET ${updates.join(',')} WHERE bus_id = ? AND id = ?`, 
    values,
    (err, results)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        if(results.affectedRows === 0){
            return res.status(404).json({error: 'Lead not found'});
        }
        res.json({message: 'Lead updated'});
    }
    );
});
//delete lead
app.delete('/api/leads/:id', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const lead_id = req.params.id; 

    db.query('DELETE FROM leads WHERE bus_id = ? AND id = ?', 
        [business_id, lead_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(result.affectedRows === 0){
                return res.status(404).json({error: 'Lead cannot be found'});
            }
            res.json({message: 'Lead deleted'});
        }
    )
})
//create appt 
app.post('/api/appointments', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const {lead_id, email, campaign_id, scheduled_at, ghl_appointment_id}= req.body;
    if(!lead_id || !email || !campaign_id || !scheduled_at){
        return res.status(400).json({error: 'Missing fields: lead ID, email, campaign ID or scheduled time'});
    }
    db.query('INSERT INTO appointments(bus_id, lead_id, email, campaign_id, scheduled_at, ghl_appointment_id) VALUES(?,?,?,?,?,?)',
        [business_id,lead_id, email, campaign_id, scheduled_at, ghl_appointment_id],
        (err, result)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            res.json({message: 'Appointment created', appointment_id:result.insertId});
        }
    )
})
//update appt
app.put('/api/appointments/:id', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const appointment_id = req.params.id;
    const { email, ghl_appointment_id, campaign_id, scheduled_at, appt_status} = req.body;
    let updates = []; 
    let values = []; 

    if(email !== undefined){
        updates.push('email = ?');
        values.push(email);
    }
    if(campaign_id !== undefined){
        updates.push('campaign_id = ?');
        values.push(campaign_id);
    }
    if(scheduled_at !== undefined){
        updates.push('scheduled_at = ?');
        values.push(scheduled_at);
    }
    if(ghl_appointment_id !== undefined){
    updates.push('ghl_appointment_id = ?');
    values.push(ghl_appointment_id);
    }

    if(appt_status !== undefined){
        updates.push('appt_status = ?');
        values.push(appt_status);
    }
    if(updates.length == 0){
        return res.status(400).json({error: 'No fields to update'})
    }
    values.push(business_id, appointment_id);

    db.query(`UPDATE appointments SET ${updates.join(',')} WHERE bus_id = ? AND id = ?`,
    values, 
    (err, results)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        if(results.affectedRows === 0){
            return res.status(404).json({error: 'Appointment not found'});
        }
        res.json({message: 'Appointment updated'});
        }
    );
});
app.get('/api/leads/:lead_id/appointments', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const lead_id = req.params.lead_id; 

    db.query('SELECT * FROM appointments WHERE bus_id = ? AND lead_id = ?', 
        [business_id, lead_id],
        (err, results)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
        res.json(results);
        }
    );


});

app.get('/api/campaigns/:id/metrics', authenticate, (req,res)=>{
    const business_id = req.business.id; 
    const campaign_id = req.params.id; 
    db.query(`
        SELECT c.id, c.start_date, c.end_date, c.campaign_name, c.daily_budget,
        c.status, DATEDDIFF(COALESCE(c.end_date, CURRDATE()), c.start_date) as total_spend, 
        COUNT(DISTINCT l.id) as total_leads, 
        COUNT(DISTINCT a.id) as total_appts,
        COUNT(DISTINCT CASE WHEN a.appt_status='showed' THEN a.id END) as total_shows,
        COUNT(DISTINCT cd.id) as total_closed_deals,
        COALESCE(SUM(cd.deal_value),) as total_revenue
        FROM campaign c
        LEFT JOIN leads l ON c.id = l.campaign_id
        LEFT JOIN appointments a ON l.id = a.lead_id
        LEFT JOIN closed_deals cd ON cd.lead_id = l.id
        WHERE c.id = ? AND c.bus_id = ? 
        GROUP BY c.id
        `, [campaign_id, business_id],
        (err, results)=>{
            if(err){
                return res.status(500).json({error: err.message});
            }
            if(results.length == 0){
                return res.status(404).json({error: 'Campaign not found'});
            }
            const data = results[0];

            const metrics = {
                campaign_id: data.id, 
                campaign_name: data.campaign_name, 
                daily_budget: data.daily_budget, 
                start_date: data.start_date, 
                end_date: data.end_date, 
                status: data.status, 
                days_run: data.days_run || 0,
                total_leads: data.total_leads || 0, 
                cost_per_lead: data.total_leads > 0 ? (data.total_spend / data.total_leads).toFixed(2) : 0, 
                total_appointments: data.total_appointments || 0, 
                cost_per_appointment: data.total_appointments > 0 ? (data.total_spend / data.total_appointments).toFixed(2) : 0, 
                total_shows: data.total_shows,
                show_rate: data.show_rate > 0 ? ((data.total_shows / data.total_appointments) * 100).toFixed(2) : 0,
                total_closed_deals: data.total_closed_deals, 
                cost_per_acquisition: data.total_closed_deals > 0 ? (data.total_spend / data.total_closed_deals).toFixed(2) : 0, 
                roas: data.total_spend > 0 ? (data.total_revenue / data.total_spend).toFixed(2) : 0
            };
            res.json(metrics);

        }
    );



});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
