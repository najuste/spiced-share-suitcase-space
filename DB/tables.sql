-- suitcase -- the db

CREATE EXTENSION postgis;


DROP TABLE IF EXISTS users;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profilepic VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS trips CASCADE;
CREATE TABLE trips(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users,
    place_a GEOGRAPHY(POINT,4326) NOT NULL,
    place_a_name TEXT NOT NULL,
    place_b GEOGRAPHY(POINT,4326)NOT NULL,
    place_b_name TEXT NOT NULL,
    trip_date DATE NOT NULL,
    size VARCHAR(25) NOT NULL,
    price INTEGER,
    description TEXT,
    status INTEGER,
    reservedby_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS trips_taken CASCADE;
CREATE TABLE trips_taken(
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips,
    user_id INTEGER NOT NULL REFERENCES users,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
