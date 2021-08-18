require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const db = mysql.createConnection({
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
app.post('/api/users', (req, res) => {
    //hash password entered, add salt
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        //create new user object, populate prooperties w/ form values
        const user = {
            FirstName:req.body.firstname,
            LastName: req.body.lastname,
            Username: req.body.username,
            Email: req.body.email,
            //send hashed password
            Password: hash
        }
        //define sql query to create new user
        let sql = 'INSERT INTO users SET ?';
        //add user object to database
        db.query(sql, user, (err, result, fields) => {
            if(err) {
                console.log(err);
                res.redirect('/');
            } else {
                res.send("User successfully created!");
            }
        });
    });
});


//For Testing Only
app.get('/api/users', (req, res) => {
    let sql = "SELECT * FROM users";
    db.query(sql, (err, results, fields) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(results);
            res.send(results);
        }
    });
});

//For Testing Only
app.get('/api/users/:id', (req, res) => {
    let sql = `SELECT * FROM users WHERE id = ${req.params.id}` 
    db.query(sql, (err, results, fields) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            console.log(results);
            res.send(results);
        }
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});