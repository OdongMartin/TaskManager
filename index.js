const express = require('express');
const app = express();

//body-parse and multer
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

const multer = require('multer');
const upload = multer();
app.use(upload.array());

const mongoose = require('mongoose');
//const passportLocalMongoose = require('passport-local-mongoose');
mongoose.connect('mongodb://127.0.0.1/my_db');

var userDetails = mongoose.Schema({
    username: String,
    //email: String,
    password: String,
});

var userInfo = mongoose.model('userInfo', userDetails);
//export userinfo model must be up
module.exports = userInfo;


app.set('view engine', 'pug');
app.set('views', './views');

//authentication using passportjs
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//express-session
const session = require('express-session');
app.use(session({
    secret: "12345678987654321",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }, // Session expiration time (e.g., 1 hour)
}));

// Initializing Passport.js
app.use(passport.initialize());
app.use(passport.session());

//configuring paassport.js
passport.use(
    new LocalStrategy(function(username, password, done) {
        userInfo.findOne({ username: username, password : password}, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false, { message: 'Incorrect username' });
            }
            /*if (!user.validatePassword(password)) {
              return done(null, false, { message: 'Incorrect password' });
            }*/
            return done(null, user);
        });
    })
);

passport.serializeUser(function(userObj, done) {
    done(null, userObj); // Serialize user ID into the session
  });
  
passport.deserializeUser(function(userObj, done) {
    // Retrieve the user from the database based on the iD
    userInfo.findOne(userObj, function(err, user) {
        if (err) {
        return done(err);
        }
        done(null, user); // Return the user object for session storage
    });
});



//signup page
app.get('/signup', function(req, res) {
    res.render('signup');
    //log all database users and their info
    userInfo.find(function(err, response) {
        console.log(response);
    })
});

app.post('/signup', function(req, res) {
    //check if user already exists in database
    userInfo.findOne({username : req.body.id}, function (err, existingUser){
        if (err) {
            res.render('signup', {message : "Database Error"});
        }
        else if (existingUser) {
            res.render('signup', {message : "Username Already Exists"});
        }
    
    //check if password is same as confirmed passwprd and then continue to create user
        else {
            if (req.body.password === req.body.confirmPassword){
                var newUser = new userInfo ({
                    username : req.body.id,
                    password : req.body.password
                });

                req.session.user = newUser;

                newUser.save(function(err, userInfo) {
                    if(err){
                        res.send("error saving user to database");
                    }
                    else {
                        res.redirect('/tasks/' + req.body.id);
                    }
                });
            }

            else {
                res.render('signup', {message : "Confirm with same password"});
            }
        } 
    });
});

//middleware
function checkSignIn(req, res, next){
    //check if session exists
    if(req.isAuthenticated()){
       return next();    
    } else {
       res.redirect('/login'); 
    }
}
function checkLoggedIn(req, res, next){
    if (req.isAuthenticated()) { 
        return res.redirect("/tasks");
    }
   next();
}

//login page
app.get('/login', checkLoggedIn, function(req, res) {
    res.render('login');
    //log all database users and their info
    userInfo.find(function(err, response) {
        console.log(response);
    });
});

app.post('/login', 
passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/login',
}));


//logout
app.get('/logout', function(req, res){
    req.session.destroy(function(err) {
        // Destroy the session
        res.redirect('/login');
    });
    //req.logout();
    //res.redirect('/login');
});

//delete entire user database
/*app.get('/delete', function(req, res) {
    userInfo.remove(function(err, response) {
        console.log ("removed all data");
    });
});*/

//use tasks router
const tasks = require('./tasks.js');
app.use('/tasks',checkSignIn, tasks);

//404 not found
app.get('*', function(req, res) {
    res.send('404 not found');
});


app.listen(3000);

