//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.SECRET); // remove this after you've confirmed it is working

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/userDB").then(() => {
    console.log("成功連結mongoDB...")
});

// ////////////// Schema /////////////////////

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

// ////////////// Route /////////////////////

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save(function(e){
        if(e){
            console.log(e);
        } else {
            res.render("secrets");
        }
    })
});

app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(e, foundUser){
        if(e){
            console.log(e);
        } else {
            if (foundUser){
                if(foundUser.password === password){
                    res.render("secrets");
                } else {
                    console.log("密碼錯誤");
                }
            }
        }
    });
});


// ////////////// Listen /////////////////////

app.listen(3000, function(){
    console.log("Server is startindg on port 3000");
});