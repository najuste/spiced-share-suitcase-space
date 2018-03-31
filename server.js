const path = require("path");
const express = require("express");

const compression = require("compression");
var morgan = require("morgan");

const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");

const app = express();
const dev = app.get("env") !== "production";

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

//---------------- routes -- to log in or to register, same route, but different forms (?)

//registration
app.post("/register", function(req, res) {
    console.log("Route /register");
    const { firstname, lastname, email, password } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash, lat, lng)
                .then(results => {
                    const {
                        id,
                        firstname,
                        lastname,
                        email,
                        lat,
                        lng
                    } = results.rows[0];

                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email,
                        lat,
                        lng
                    };
                    res.json({
                        success: true,
                        loggedin: true,
                        user: req.session.loggedin
                    });
                });
        })
        .catch(err => {
            if (err.code == "23505") {
                console.log(err, "Same email");
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
            console.log("results from getDataByEmail");
            if (!results.rows.length) {
                console.log("The email has not been registered yet");
                res.json({
                    success: false,
                    errorMsg:
                        "The email you have entered has not been registered yet. Please check if you typed it correctly or register"
                });
            } else {
                let hashedPassword = results.rows[0].password;
                return checkPassword(password, hashedPassword).then(
                    matching => {
                        if (!matching) {
                            console.log("Ups, the password did not match");
                            res.json({
                                success: false,
                                errorMsg:
                                    "The password you have entered did not match the given email"
                            });
                        } else {
                            //matching password ! setting cookies
                            let cookies = results.rows[0];
                            if (cookies.profilepic) {
                                cookies.profilepic =
                                    config.s3Url + cookies.profilepic;
                            }
                            console.log("Logged in cookies:", cookies);

                            req.session = {
                                loggedin: cookies
                            };
                            res.json({
                                success: true
                            });
                        }
                    }
                );
            }
        })
        .catch(err => console.log(err));
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
