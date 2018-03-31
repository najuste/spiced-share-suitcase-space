//spicedPg ??
const spicedPg = require("spiced-pg");

if (!process.env.DATABASE_URL) {
    var { dbUser, dbPass } = require("./../secrets.json");
}

var db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${dbUser}:${dbPass}@localhost:5432/socialnetwork`
);

//// USERS TABLE QUERIES
exports.register = function(firstname, lastname, email, hash) {
    return db.query(
        `INSERT INTO users (firstname, lastname, email, password)
            VALUES ($1, $2, $3, $4) RETURNING * `,
        [firstname, lastname, email, hash]
    );
};

exports.updateDesc = function(id, description) {
    return db.query(
        `UPDATE users SET (description=$2) WHERE id= $1 RETURNING *`,
        [id, description]
    );
};

exports.updatePic = function(id, profilepic) {
    return db.query(
        `UPDATE users SET (profilepic=$2) WHERE id= $1 RETURNING *`,
        [id, profilepic]
    );
};

// CHECKING LOG in
exports.getDataByEmail = function(email) {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

//// TRIPS TABLE QUERIES (price is optional)
//If you do not specify an SRID, the SRID will default to 4326 WGS 84 long/lat will be used, and all calculations will proceed using WGS84.
exports.createTrip = function(
    user_id,
    place_a,
    place_b,
    trip_date,
    space,
    price,
    description
) {
    return db.query(
        `INSERT INTO trips (user_id, place_a, place_b, trip_date, space, price, description)
    VALUES ($1, ST_GeogFromText('POINT($2)', ST_GeogFromText('POINT($3)', $4, $5, $6, $7)
    RETURNING *`,
        [user_id, place_a, place_b, trip_date, space, price, description]
    );
};

// query for update trips status
exports.updateTripStatus = function(id, status) {
    return db.query(`UPDATE trips SET (status=$2) WHERE id=$1 RETURNING *`, [
        id,
        status
    ]);
};
// query to update trips description?? // price?? // date ?? //

exports.takeTrip = function(trip_id, user_id) {
    return db.query(
        `INSERT INTO trips_taken (trip_id, user_id) VALUES ($1, $2) RETURNING *`,
        [trip_id, user_id]
    );
}; // after this automatically update the table trips, to set status to 1 (taken)
