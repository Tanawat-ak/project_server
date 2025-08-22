const con = require('./db');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------ Get expenses ------------------
app.get('/expenses', (req, res) => {
    const user_id = req.query.user_id;
    let sql;
    let params = [];

    if (user_id) {
        sql = "SELECT * FROM expense WHERE user_id = ?";
        params.push(user_id);
    } else {
        sql = "SELECT * FROM expense";
    }
    
    con.query(sql, params, (err, results) => {
        if (err) return res.status(500).send("Database error!");
        res.json(results);
    });
});

// ------------------ Login ------------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT id, password FROM users WHERE username = ?";
    con.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send("Database server error");

        if (results.length !== 1) {
            return res.status(401).send("Wrong username");
        }

        bcrypt.compare(password, results[0].password, (err, same) => {
            if (err) return res.status(500).send("Hashing error");

            if (same) {
                // send JSON with user_id
                return res.json({ user_id: results[0].id });
            } else {
                return res.status(401).send("Wrong password");
            }
        });
    });
});

// ------------- feature search --------------


// ------------- feature add --------------
app.post('/expenses', (req, res) => {
    const { user_id, item, paid, date } = req.body;

    if (!user_id || !item || !paid || !date) {
        return res.status(400).send("Missing required fields");
    }

    const sql = "INSERT INTO expense (user_id, item, paid, date) VALUES (?, ?, ?, ?)";
    con.query(sql, [user_id, item, paid, date], (err, results) => {
        if (err) return res.status(500).send("Database error! " + err);
        res.status(201).send("New Expense added successfully");
    });
});


// ------------- feature delete --------------



// ---------- Server starts here ---------
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running at port ' + PORT);
});
