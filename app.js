require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

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
app.post('/', (req, res) => {
    //get username and password from login form
    const username = req.body.username;
    const password = req.body.password;
    //create sql query to find user in database
    let sql = `SELECT * FROM users WHERE Username='${username}' OR Email='${username}'`;
    db.query(sql, (err, foundUser, fields) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            //if user exists. Query returns array of objects, use index 0
            if(foundUser[0]) {
                //compare form password to hashed password in db
                bcrypt.compare(password, foundUser[0].Password, (err, result) => {
                    //log user in if passwords match
                    if(result) {
                        console.log('User successfully logged in.');
                        res.redirect('/home');
                    //throw error if user credentials dont match
                    } else {
                        console.log("Incorrect credentials.");
                        res.redirect('/');
                    }
                });
            //throw error if user doesn't exist 
            } else {
                console.log("User does not exist.");
                res.redirect('/')
            }
        }
    });
});
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});

//REST API
app.post('/api/users', (req, res) => {
    //add salt and hash per number of salt rounds
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
                res.redirect('/signup')
            } else {
                console.log("User successfully created!");
                res.redirect('/');
            }
        });
    });
});

app.delete('/api/users/:id', (req, res) => {
    //sql query for deleting a specific user based on their ID
    let sql = `DELETE FROM users WHERE ID = ${req.params.id}`;
    //query db to delete user
    db.query(sql, (err, result, fields) => {
        if(err) {
            console.log(err);
        } else {
            res.send("User successfully deleted.");
        }
    });
});

// //For Testing Only
// app.get('/api/users', (req, res) => {
//     let sql = "SELECT * FROM users";
//     db.query(sql, (err, results, fields) => {
//         if(err) {
//             console.log(err);
//         } else {
//             res.send(results);
//         }
//     });
// });

// //For Testing Only
// app.get('/api/users/:id', (req, res) => {
//     let sql = `SELECT * FROM users WHERE id = ${req.params.id}` 
//     db.query(sql, (err, results, fields) => {
//         if(err) {
//             console.log(err);
//         } else {
//             res.send(results);
//         }
//     });
// });

app.listen(3000, () => {
    console.log("Server running on port 3000");
});