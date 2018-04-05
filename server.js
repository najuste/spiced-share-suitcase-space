const path = require("path");
const url = require("url");
const querystring = require("querystring");

const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const compression = require("compression");
const express = require("express");
const multer = require("multer");
const uidSafe = require("uid-safe");

const config = require("./config.json");
const db = require("./db/db.js");
const s3 = require("./s3");

var morgan = require("morgan");

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

app.use(compression());
app.use(morgan("dev"));
app.use(express.static(path.resolve(__dirname, "build")));

// if (!dev) {
//     app.disable("x-powered-by");
//     app.use(compression());
//     app.use(morgan("combined"));
//     app.use(express.static(path.resolve(__dirname, "build")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "build", "index.html"));
//     });
// }
// if (dev) {
//     app.use(morgan("dev"));
//     app.use(express.static(path.resolve(__dirname, "build")));
//
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "build", "index.html"));
//     });
// }

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieSessionMiddleware);

//---------------- FILE UPLOAD - diskStorage

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

//---------------- routes -- to log in /register
//routes not to access if not registered
app.get("/profile", function(req, res) {
    if (!req.session.loggedin) {
        res.redirect("/login");
    }
});

//login

app.get("/login", function(req, res, next) {
    console.log("Got inside the /login");
    if (req.session.loggedin) {
        res.redirect("/");
    } else {
        next();
    }
});
// app.get("/share-suitcase", function(req, res) {
//     if (!req.session.loggedin) {
//         res.redirect("/login");
//     }
// });

//registration
app.post("/register", function(req, res) {
    console.log("In Route /register", req.body);

    const { firstname, lastname, email, password } = req.body;
    hashPassword(password)
        .then(hash => {
            return db
                .register(firstname, lastname, email, hash)
                .then(results => {
                    //returns directly format as pg.spiced results.rows(!)
                    const { id, firstname, lastname, email } = results;
                    req.session.loggedin = {
                        id,
                        firstname,
                        lastname,
                        email
                    };
                    console.log("Cookies: ", req.session.loggedin);
                    res.json({
                        success: true,
                        user: req.session.loggedin
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

// app.get("/", function(req, res) {
//     console.log("IN MAIN / route");
// });

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
                    console.log("matching password !, send response");
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
                    console.log("Login cookies from res.json ", req.session);
                    res.json({
                        success: true,
                        user: req.session.loggedin
                    });
                }
            });
        })
        .catch(err => {
            if (!err.received) {
                // err.received code 0 - that email has been registered
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

//getting user data
app.get("/user-data", function(req, res) {
    console.log("In /user-data route", req.session);
    if (req.session.loggedin) {
        res.json({ user: req.session.loggedin });
    } else {
        console.log("there is a problem, user is not logged in...");
        //testing purposes when cookies  are short term
        res.json({});
    }
});

app.get("/latest-suitcases", function(req, res) {
    console.log("Inside the latest-suitcase");
    let limitResultsTo = 10;
    return db
        .getLatestSuitcases(limitResultsTo)
        .then(results => {
            console.log("Getting latest suitcases", results);
            results.map(item => {
                item.trip_date = new Date(item.trip_date).toDateString();
            });
            res.json({ results });
        })
        .catch(err => console.log(err));
});

app.get("/get-suitcase/:id", function(req, res) {
    return db
        .getSuitcaseById(req.params.id)
        .then(results => {
            if (results) {
                console.log("Got suitcase:", results);
                if (results.profilepic) {
                    results.profilepic = config.s3Url + results.profilepic;
                }

                //let date = new Date(results.trip_date);
                results.trip_date = new Date(results.trip_date).toDateString();
                console.log("Updated suitcase profilepic:", results);
                //profile pic update url
                // console.log("Friendship state with:", req.params.id);
                res.json({ results });
            } else {
                res.json({ user: "none" });
            }
        })
        .catch(err => console.log("Error fetching data", err));
    //do query
});

app.post("/reserve-suitcase", function(req, res) {
    console.log(
        "Inside route /reserve-suitcase ",
        req.body,
        req.session.loggedin.id
    );
    //id - suitcase id
    return db
        .reserveSuitcaseById(req.body.id, req.session.loggedin.id)
        .then(results => {
            console.log("Succesfully updated", results);
            res.json({
                success: true
            });
        })
        .catch(err => {
            console.log("Err in pic upload", err);
        });
});

app.post("/pic-upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("Route /pic-upload", req.file);
    if (req.file) {
        return db
            .updatePic(req.session.loggedin.id, req.file.filename)
            .then(results => {
                console.log("Results from db", results);
                // TODO: TO MAKE THAT s§Url just in one place, so that I don't have to update each time?
                req.session.loggedin.profilepic =
                    config.s3Url + results.profilepic;
                res.json({
                    success: true,
                    image: config.s3Url + results.profilepic
                });
            })
            .catch(err => {
                console.log("Err in pic upload", err);
            });
    } else {
        console.log("Fail... upload");
        res.json({
            success: false,
            errorMsg: "Upload failed, try again"
        });
    }
});

app.post("/desc-submit", function(req, res) {
    console.log("Inside route /desc-submit ", req.body);
    if (req.body.desc) {
        return db
            .updateDesc(req.session.loggedin.id, req.body.desc)
            .then(results => {
                console.log("Results from updateDesc", results);
                res.json({
                    success: true
                });
            });
    } else {
        console.log("Failed... desc update");
        res.json({
            success: false,
            errorMsg: "Description update failed, try again"
        });
    }
});

//// TODO: It could be two queries, for share and for space so that limit works better
app.get("/user-suitcase", function(req, res) {
    let limitSuitcases = 10;
    console.log("Results from /user-suitcase", req.session.loggedin.id);
    return db
        .getUserSuitcase(req.session.loggedin.id, limitSuitcases)
        .then(results => {
            console.log("Results from /user-suitcase", results);
            res.json({
                success: true,
                id: req.session.loggedin.id,
                results
            });
        })
        .catch(err => console.log(err));
});

app.get("/search-suitcase", function(req, res) {
    console.log("Inside search-suitcase route", req.url);
    const urlParams = url.parse(req.url);
    const query = querystring.parse(urlParams.query);
    //querystring
    if (query) {
        const { place_a, place_b, trip_date, size } = query;
        console.log("Checking query passed to db", query);
        return db
            .searchForSuitcase(place_a, place_b, trip_date, size, 10000, 10000)
            .then(results => {
                console.log("Results from search-suitcase", results);
                //results.trip_date = results.trip_date.toDateString();
                results.map(item => {
                    item.trip_date = new Date(item.trip_date).toDateString();
                });

                res.json({
                    success: true,
                    results
                });
            })
            .catch(err => console.log(err));
    } else {
        console.log("Query failed... please type in real data");
        res.json({
            success: false,
            errorMsg:
                "Something went wrong with your entered choises, please choose the drop down cities"
        });
    }
});

app.post("/share-suitcase", function(req, res) {
    console.log("Inside share-suitcase route", req.body.shareParams);

    if (req.body.shareParams) {
        let user_id = req.session.loggedin.id;
        const {
            place_a,
            place_a_name,
            place_b,
            place_b_name,
            trip_date,
            size
        } = req.body.shareParams;
        return db
            .shareASuitcase(
                user_id,
                place_a,
                place_a_name,
                place_b,
                place_b_name,
                trip_date,
                size
            )
            .then(results => {
                console.log("Results from search-suitcase", results);
                res.json({
                    success: true
                });
            })
            .catch(err => console.log(err));
    } else {
        console.log("Query failed... please type in real data");
        res.json({
            success: false,
            errorMsg:
                "Something went wrong with data your entered, please be sure to choose from the drop down cities"
        });
    }
});

app.get("/favicon.ico", function(req, res) {
    res.status(204);
});

app.get("*", function(req, res) {
    console.log("In all routes:Cookies: ", req.session.loggedin);
    // if (!req.session.loggedin && req.url == "/profile") {
    //     res.redirect("/login");
    // }
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
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
