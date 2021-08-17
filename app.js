const express = require("express");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.render("login");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});