const path = require("path");
const express = require("express");
const db = require("./db/db.js");
const config = require("./config.json");

const compression = require("compression");
var morgan = require("morgan");

const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
const dev = app.get("env") !== "production";

//---------------- cookies
const cookieSession = require("cookie-session");
const cookieSessionMiddleware = cookieSession({
    secret:
        process.env.SESSION_SECRET || require("./secrets.json").cookieSecret,
    maxAge: 1000 * 60 * 60 * 24 * 90
});

//---------------- midlewares

if (!dev) {
    app.disable("x-powered-by");
    app.use(compression());
    app.use(morgan("combined"));
    app.use(express.static(path.resolve(__dirname, "build")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "build", "index.html"));
    });
}
if (dev) {
    app.use(morgan("dev"));
    app.use(express.static(path.resolve(__dirname, "build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "build", "index.html"));
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieSessionMiddleware);

//---------------- routes -- to log in or to register, same route, but different forms (?)

//registration
app.post("/register", function(req, res) {
    console.log("In Route /register", req.body);

    const { firstname, lastname, email, password } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash)
                .then(results => {
                    //returns directly format pas pg.spiced results.rows(!)
                    const { id, firstname, lastname, email } = results;
                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email
                    };
                    res.json({
                        success: true,
                        loggedin: true,
                        data: results
                        // user: req.session.loggedin
                    });
                });
        })
        .catch(err => {
            if (err.code == "23505") {
                console.log("Same email...");
                res.json({
                    success: false,
                    errorMsg: "User with such email already registered"
                });
            } else {
                console.log(err, "Undefined error occured, please try again");
                res.json({
                    success: false,
                    errorMsg: "Undefined error occured, please try again"
                });
            }
        });
});

//login
app.post("/login", function(req, res) {
    const { email, password } = req.body;
    console.log("Loggin route /login");
    return db
        .getDataByEmail(email)
        .then(results => {
            console.log("results from getDataByEmail", results);
            let hashedPassword = results.password;
            return checkPassword(password, hashedPassword).then(matching => {
                if (!matching) {
                    console.log("Ups, the password did not match");
                    res.json({
                        success: false,
                        errorMsg:
                            "The password you have entered did not match the given email"
                    });
                } else {
                    //matching password !
                    //setting cookies
                    const { id, firstname, lastname, email } = results;
                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email
                    };
                    if (results.profilepic) {
                        req.session.loggedin.profilepic =
                            config.s3Url + results.profilepic;
                    }
                    res.json({
                        success: true
                    });
                }
            });
        })
        .catch(err => {
            if (!err.received) {
                console.log("The email has not been registered yet");
                res.json({
                    success: false,
                    errorMsg:
                        "The email you have entered has not been registered yet. Please check if you typed it correctly or register"
                });
            } else {
                console.log(err);
            }
        });
});

app.listen(process.env.PORT || 8080, () => console.log("Nieko tokio"));

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
