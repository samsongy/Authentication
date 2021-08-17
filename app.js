require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

var db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  });

  db.connect((err) => {
      if(err) {
          console.log(err);
      } else {
          console.log("Connected!")
      }
  });

app.get('/', (req, res) => {
    res.render("login");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});