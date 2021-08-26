require('dotenv').config();
const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const User = require('./models/User');
const { Op } = require("sequelize");
const flash = require('express-flash');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//sequalize connection
require("./database/connection");
const initializePassport = require('./passport.config');
initializePassport(
    passport, 
    async (username) => {
        return await User.findAll({
            where: {
                [Op.or]: [
                    { userName: username },
                    { email: username }
                ]
            }
        });
    },
    async (id) => {
        return await User.findAll({
            where: {
                id : id
            }
        });
    }
);

//Routes
app.get('/', checkAuthentication, (req, res) => {
    res.render('home', { user: req.user[0].dataValues});
});

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login");
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup');
});

app.post('/signup', checkNotAuthenticated, (req, res) => {
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

app.post('/logout', (req, res) => {
    req.logOut();
    res.redirect('/login');
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

function checkAuthentication(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    } 
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }
    next();
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

