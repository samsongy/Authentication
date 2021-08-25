const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

//sequalize connection
require("./database/connection");

//Routes
app.get('/', (req, res) => {
    res.render("login");
});
// app.post('/', (req, res) => {
//     //get username and password from login form
//     const username = req.body.username;
//     const password = req.body.password;
//     //create sql query to find user in database
//     let sql = `SELECT * FROM users WHERE Username='${username}' OR Email='${username}'`;
//     db.query(sql, (err, foundUser, fields) => {
//         if(err) {
//             console.log(err);
//             res.redirect('/');
//         } else {
//             //if user exists. Query returns array of objects, use index 0
//             if(foundUser[0]) {
//                 //compare form password to hashed password in db
//                 bcrypt.compare(password, foundUser[0].Password, (err, result) => {
//                     //log user in if passwords match
//                     if(result) {
//                         console.log('User successfully logged in.');
//                         res.redirect('/home');
//                     //throw error if user credentials dont match
//                     } else {
//                         console.log("Incorrect credentials.");
//                         res.redirect('/');
//                     }
//                 });
//             //throw error if user doesn't exist 
//             } else {
//                 console.log("User does not exist.");
//                 res.redirect('/')
//             }
//         }
//     });
// });
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.get('*', (req, res) => {
    res.render('error');
});

app.post('/signup', (req, res) => {
    //take password from sign up form and salt and hash
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
        //attempt
        try {
            //create new user instance and add to db
            const User = require('./models/User');
            const user = await User.create({
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                userName: req.body.username,
                email: req.body.email,
                //send hash password to db
                password: hash
            });
            //if error, log and redirect to signup screen 
            if(err) {
                console.log(err);
                res.redirect('/signup');
            //if success print success message and nav to login screen
            } else {
                console.log('User successfully created!');
                res.redirect('/');
            }
        //if error log and nav to signup screen
        } catch(e) {
            console.log(e);
            res.redirect('/signup');
        }
    });
});

// app.delete('/api/users/:id', (req, res) => {
//     //sql query for deleting a specific user based on their ID
//     let sql = `DELETE FROM users WHERE ID = ${req.params.id}`;
//     //query db to delete user
//     db.query(sql, (err, result, fields) => {
//         if(err) {
//             console.log(err);
//         } else {
//             res.send("User successfully deleted.");
//         }
//     });
// });

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