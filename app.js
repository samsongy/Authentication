require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

var db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

//Check db connection
db.connect((err) => {
    if(err) {
        console.log(err);
    } else {
        console.log("MySQL Connected!")
    }
});

//Routes
app.get('/', (req, res) => {
    res.render("login");
});

//REST API
app.get('/api/users', (req, res) => {
    let sql = "SELECT * FROM users";
    db.query(sql, (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});

app.get('/api/users/:id', (req, res) => {
    let sql = `SELECT * FROM users WHERE id = ${req.params.id}` 
    db.query(sql, (err, rows, fields) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(rows);
            res.send(rows);
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});