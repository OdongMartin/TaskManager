//host things
require('dotenv').config();
const PORT = process.env.PORT || 3000;

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

//host things continued
mongoose.set('strictQuery', false);
const connectDB = async function() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


//mongoose.connect('mongodb://127.0.0.1/my_db');

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
    // Check if the username only contains lowercase letters and no spaces
    if (!/^[a-zA-Z0-9]+$/.test(req.body.id) || req.body.id.includes(' ')) {
        return res.render('signup', { message: 'Invalid username format' });
    }
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
                    username : req.body.id.toLowerCase(),
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

app.post('/login', function(req, res, next){
    req.body.username = req.body.username.toLowerCase();

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', {message : "Enter correct details or just sign up"});
        }

        //manually establishing user sesssion
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/tasks');
        });

    })(req, res, next);
}
//passport js standard user session approach
/*passport.authenticate('local', {
    successRedirect: '/tasks',
    failureRedirect: '/login',
})*/);


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

//change password
app.get('/changePassword', function(req, res) {
    res.render('change-password', {user : req.user.username});
})
app.post('/changePassword', function(req, res) {
    if (req.body.oldPassword !== req.user.password){
        res.render('change-password', {message : "Please enter correct old password"});
    }

    req.user.password = req.body.newPassword;
    // Save the updated user object to the database
    req.user.save(function (err) {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        return res.render('change-password', { message: "Password Changed. Please Log in" });
    });
    //works as above
    /*if (req.body.newPassword === req.body.confirmPassword) {
        userInfo.findOneAndUpdate({username : req.user.username}, {password : req.body.newPassword}, function(err, editedPassword) {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            } else {
                res.render ('change-password', {message : "Password Changed"});
            }
        });
    }*/
});

//use tasks router
const tasks = require('./tasks.js');
app.use('/tasks',checkSignIn, tasks);

//404 not found
app.get('*', function(req, res) {
    res.send('404 not found');
});


//connect to database
connectDB().then(function() {
    app.listen(PORT, function() {
        console.log(`listening on port ${PORT}`);
    })
})
//app.listen(3000);

