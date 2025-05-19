// const db = require("./config/db");
const express = require("express");
// const mongoose = require('mongoose');
// const expressSession = require("express-session");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const crypto = require("crypto");
const routes = require("./routes");
const db = require("./config/db");

const app = express();

// Package documentation - https://www.npmjs.com/package/connect-mongo
// const MongoStore = require("connect-mongo")(session);

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();

// Create the Express application

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * -------------- SESSION SETUP ----------------
 */

const pgPool = db;

app.use(
  session({
    store: new pgSession({
      pool: pgPool, // Connection pool
      tableName: "session", // Use another table-name than the default "session" one
      // Insert connect-pg-simple options here
    }),
    secret: process.env.SECRET, // Ensure this environment variable is set
    resave: false, // Do not save session if unmodified
    saveUninitialized: false, // Do not create session until something stored
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    // Insert express-session options here
  })
);

// TODO

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

app.use(passport.initialize());
app.use(passport.session());

/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(routes);

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:3000
app.listen(3000 || process.env.PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
