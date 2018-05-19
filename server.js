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
// app.get("/profile", function(req, res) {
//     if (!req.session.loggedin) {
//         res.redirect("/login");
//     }
// });

//login

app.get("/share-suitcase", function(req, res) {
    if (!req.session.loggedin) {
        res.redirect("/login");
    }
});

//registration
app.post("/register", function(req, res) {
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
                    res.json({
                        success: true,
                        user: req.session.loggedin
                    });
                });
        })
        .catch(err => {
            if (err.code == "23505") {
                res.json({
                    success: false,
                    errorMsg: "User with such email already registered"
                });
            } else {
                res.json({
                    success: false,
                    errorMsg: "Undefined error occured, please try again"
                });
            }
        });
});

app.post("/login", function(req, res) {
    const { email, password } = req.body;
    return db
        .getDataByEmail(email)
        .then(results => {
            let hashedPassword = results.password;
            return checkPassword(password, hashedPassword).then(matching => {
                if (!matching) {
                    res.json({
                        success: false,
                        errorMsg:
                            "The password you have entered did not match the given email"
                    });
                } else {
                    console.log("matching password !, send response");
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
                        success: true,
                        user: req.session.loggedin
                    });
                }
            });
        })
        .catch(err => {
            if (!err.received) {
                res.json({
                    success: false,
                    errorMsg:
                        "The email you have entered has not been registered yet. Please check if you have typed it correctly or follow the link at the bottom to register"
                });
            } else {
                console.log(err);
            }
        });
});

//getting user data
app.get("/user-data", function(req, res) {
    if (req.session.loggedin) {
        return db
            .getDataByEmail(req.session.loggedin.email)
            .then(user => {
                if (user.profilepic) {
                    user.profilepic = config.s3Url + user.profilepic;
                }
                res.json({ user });
            })
            .catch(err => {
                //testing purposes when cookies  are short term
                console.log("there is a problem,", err);
                res.json({
                    success: false,
                    errorMsg: err
                });
            });
    } else {
        return res.json({});
    }
});

app.get("/latest-suitcases", function(req, res) {
    let limitResultsTo = 10;
    return db
        .getLatestSuitcases(limitResultsTo)
        .then(results => {
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

                results.trip_date = new Date(results.trip_date).toDateString();
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
    return db
        .getUserSuitcase(req.session.loggedin.id, limitSuitcases)
        .then(results => {
            res.json({
                success: true,
                id: req.session.loggedin.id,
                results
            });
        })
        .catch(err => console.log(err));
});

app.get("/search-suitcase", function(req, res) {
    const urlParams = url.parse(req.url);
    const query = querystring.parse(urlParams.query);
    //querystring

    if (query) {
        let user_id;
        const { place_a, place_b, trip_date, size, search_radius } = query;
        {
            req.session.loggedin
                ? (user_id = req.session.loggedin.id)
                : (user_id = 0);
        }
        return db
            .searchForSuitcase(
                place_a,
                place_b,
                trip_date,
                size,
                search_radius,
                user_id
            )
            .then(results => {
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
                "Something went wrong with your entered choises, please choose the city from the drop down"
        });
    }
});

app.post("/share-suitcase", function(req, res) {
    if (req.body.shareParams) {
        let user_id = req.session.loggedin.id;
        const {
            place_a,
            place_a_name,
            place_b,
            place_b_name,
            trip_date,
            size,
            description
        } = req.body.shareParams;
        return db
            .shareASuitcase(
                user_id,
                place_a,
                place_a_name,
                place_b,
                place_b_name,
                trip_date,
                size,
                description
            )
            .then(results => {
                console.log("Results from search-suitcase", results);
                res.json({
                    success: true
                });
            })
            .catch(err => console.log(err));
    } else {
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
    // } else if (
    //     (req.session.loggedin && req.url != "/login") ||
    //     req.url != "/register"
    // ) {
    //     res.redirect("/login");
    // }

    res.sendFile(path.resolve(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 8080, () => console.log("Listening on 8080"));

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
