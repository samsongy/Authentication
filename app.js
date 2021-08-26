const express = require('express');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('./models/User');
const { Op } = require("sequelize");
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

app.post('/', async (req, res) => {
    //attempt code
    try {
        const username = req.body.username;
        const password = req.body.password;
        //query db if there is a user where username field matches a users email or username
        const foundUser = await User.findAll({
            where: {
                [Op.or]: [
                    { userName: username },
                    { email: username }
                ]
            }
        });
        //if there is a found user
        if(foundUser[0]) {
            //check to see if their password is correct
            bcrypt.compare(password, foundUser[0].password, (err, result) => {
                //if error log and redirect to login page
                if(err) {
                    console.log(err);
                    res.redirect('/');
                } else {
                    //if passwords match log user into home page
                    if(result) {
                        console.log("User successfully logged in!");
                        res.render('home', { name: foundUser[0].firstName});
                    //if credentials are in correct log error and redirect to login
                    } else {
                        console.log("Incorrect credentials.");
                        res.redirect('/');
                    }
                }
            });
        //if the user doesnt exist log and redirect to login screen 
        } else {
            console.log('User does not exist.');
            res.redirect('/');
        }
    //if function cant be completed, log error and redirect to login screen 
    } catch(e) {
        console.log(e);
        res.redirect('/');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    //take password from sign up form and salt and hash
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
        //attempt code
        try {
            //create new user instance and add to db
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

app.get('*', (req, res) => {
    res.render('error');
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