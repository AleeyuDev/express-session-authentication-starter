const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("./db");
// const User = connection.models.User;
const passwordUtils = require("../lib/passwordUtils");

// const validPassword = require("../passwordUtils").validPassword;
// const generateHash = require("../passwordUtils").generateHash;

const validPassword = require("../lib/passwordUtils").validPassword;
const generateHash = require("../lib/passwordUtils").genPassword;

const customField = {
  usernameField: "username",
  passwordField: "password",
};
const verifyCallback = (username, password, done) => {
  db.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (err, result) => {
      if (err) {
        return done(err);
      }
      if (result.rows.length === 0) {
        return done(null, false, { message: "Incorrect username." });
      }
      const user = result.rows[0];
      if (!passwordUtils.validPassword(password, user.hash, user.salt)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    }
  );
};

// create a strategies

const strategy = new LocalStrategy(customField, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return done(err);
    }
    if (result.rows.length === 0) {
      return done(null, false, { message: "User not found." });
    }
    return done(null, result.rows[0]);
  });
});

// // TODO:
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "username",
//       passwordField: "password",
//     },
//     (username, password, done) => {
//       db.query(
//         "SELECT * FROM users WHERE username = $1",
//         [username],
//         (err, result) => {
//           if (err) {
//             return done(err);
//           }
//           if (result.rows.length === 0) {
//             return done(null, false, { message: "Incorrect username." });
//           }
//           const user = result.rows[0];
//           if (!passwordUtils.validPassword(password, user.hash, user.salt)) {
//             return done(null, false, { message: "Incorrect password." });
//           }
//           return done(null, user);
//         }
//       );
//     }
//   )
// );
