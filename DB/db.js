const initOptions = {
    error: (error, e) => {
        if (e.cn) {
            console.log("CN:", e.cn);
            console.log("EVENT:", error.message || error);
        }
    }
};
const pgp = require("pg-promise")(initOptions);

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./../secrets.json");
}

const db = pgp(
    process.env.DATABASE_URL ||
        `postgresql://${dbUser}:${dbPass}@localhost:5432/suitcase`
);

db
    .connect()
    .then(obj => {
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log("ERROR:", error.message || error);
    });

//options in pgp: one none any

//// USERS TABLE QUERIES
exports.register = function(firstname, lastname, email, hash) {
    console.log("Got in db.js,", firstname);
    return db.one(
        `INSERT INTO users (firstname, lastname, email, password)
            VALUES ($1, $2, $3, $4) RETURNING * `,
        [firstname, lastname, email, hash]
    );
};

exports.updateDesc = function(id, description) {
    return db.none(`UPDATE users SET description = $2 WHERE id= $1`, [
        id,
        description
    ]);
};

exports.updatePic = function(id, profilepic) {
    return db.one(
        `UPDATE users SET profilepic = $2 WHERE id= $1 RETURNING profilepic`,
        [id, profilepic]
    );
};

// CHECKING LOG in
exports.getDataByEmail = function(email) {
    return db.one(`SELECT * FROM users WHERE email = $1`, [email]);
};

//// TRIPS TABLE QUERIES (price is optional)
//If you do not specify an SRID, the SRID will default to 4326 WGS 84 long/lat will be used, and all calculations will proceed using WGS84.

exports.getLatestSuitcases = function(limit) {
    return db.any(
        `SELECT * FROM trips WHERE status is null ORDER BY created_at DESC LIMIT $1`,
        [limit]
    );
};

exports.getSuitcaseById = function(id) {
    return db.one(
        `SELECT trips.id as tripsid, place_a_name, place_b_name, trip_date, size, price, trips.description,
        users.id, firstname, lastname, profilepic, email
    FROM trips JOIN users ON trips.user_id = users.id
    WHERE trips.id = $1`,
        [id]
    );
};
//suitcase id // reserved by user_id
exports.reserveSuitcaseById = function(id, reservedby_id) {
    return db.none(
        `UPDATE trips SET status = 1, reservedby_id = $2 WHERE id = $1`,
        [id, reservedby_id]
    );
};

exports.shareASuitcase = function(
    user_id,
    place_a,
    place_a_name,
    place_b,
    place_b_name,
    trip_date,
    size
) {
    return db.one(
        `INSERT INTO trips (user_id, place_a, place_a_name, place_b, place_b_name, trip_date, size)
    VALUES ($1, ST_GeogFromText($2), $3, ST_GeogFromText($4), $5, $6, $7)
    RETURNING *`,
        [user_id, place_a, place_a_name, place_b, place_b_name, trip_date, size]
    );
};
//
//  umut id 16
// UPDATE trips SET description = 'Have to bring bikes from our long trip. Also visiting relatives and such. So not much space in luggage, but will have space some small things' WHERE id= 11

exports.searchForSuitcase = function(
    place_a,
    place_b,
    trip_date,
    size,
    search_radius,
    user_id
) {
    //10km
    return db.any(
        `SELECT trips.id as tripsid, place_a_name, place_b_name, trip_date, size, price,
        users.id, firstname, lastname, profilepic, email
        FROM trips
        JOIN users ON trips.user_id = users.id
        WHERE ST_DWithin($1, place_a, CAST($5 AS INTEGER)) AND
        ST_DWithin($2, place_b, CAST($5 AS INTEGER))
        AND trips.user_id != $6
        AND trip_date BETWEEN CURRENT_DATE AND CAST($3 AS DATE)
        AND status is null
        AND size= CAST('small' AS TEXT)`,
        [place_a, place_b, trip_date, size, search_radius, user_id]
    );
};

// query to update trips description?? // price?? // date ?? //
exports.takeTrip = function(trip_id, user_id) {
    return db.one(
        `INSERT INTO trips_taken (trip_id, user_id) VALUES ($1, $2) RETURNING *`,
        [trip_id, user_id]
    );
}; // after this automatically update the table trips, to set status to 1 (taken)

exports.getUserSuitcase = function(user_id, limit) {
    return db.any(
        `SELECT * FROM trips
        WHERE user_id = $1 OR reservedby_id = $1
        ORDER BY created_at DESC LIMIT $2`,
        [user_id, limit]
    );
};
