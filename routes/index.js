const router = require("express").Router();
const passport = require("passport");
// const genPassword = require("../lib/passwordUtils").genPassword;
const { genPassword, validPassword } = require("../lib/passwordUtils");
const db = require("../config/db");
// const User = connection.models.User;

/**
 * -------------- POST ROUTES ----------------
 */

// TODO
// router.post("/login", passport.authenticate("local"), (req, res, next) => {
//   db.query(
//     "SELECT * FROM users WHERE username = $1",
//     [req.body.username],
//     (err, result) => {
//       if (err) {
//         console.error("Error executing query", err);
//         return res.status(500).send("Internal Server Error");
//       }
//       if (result.rows.length === 0) {
//         return res.redirect("/login-failure");
//       }
//       const user = result.rows[0];
//       if (passwordUtils.verifyPassword(req.body.password, user.hash)) {
//         req.login(user, (err) => {
//           if (err) {
//             return next(err);
//           }
//           return res.redirect("/login-success");
//         });
//       } else {
//         return res.redirect("/login-failure");
//       }
//     }
//   );
// });

router.post("/login", passport.authenticate("local"), (req, res, next) => {
  db.query(
    "SELECT * FROM users WHERE username = $1",
    [req.body.username],
    (err, result) => {
      if (err) {
        console.error("Error executing query", err);
        return res.status(500).send("Internal Server Error");
      }
      if (result.rows.length === 0) {
        return res.redirect("/login-failure");
      }
      const user = result.rows[0];
      if (validPassword(req.body.password, user.hash, user.salt)) {
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect("/login-success");
        });
      } else {
        return res.redirect("/login-failure");
      }
    }
  );
});

// // TODO
// router.post("/register", (req, res, next) => {
//   genPassword(req.body.password, (err, hash) => {
//     if (err) {
//       console.error("Error generating password hash", err);
//       return res.status(500).send("Internal Server Error");
//     }
//     const { salt, hash: passwordHash } = hash;
//     db.query(
//       "INSERT INTO users (username, hash, salt) VALUES ($1, $2, $3)",
//       [req.body.username, passwordHash, salt],
//       (err) => {
//         if (err) {
//           console.error("Error inserting user into database", err);
//           return res.status(500).send("Internal Server Error");
//         }
//         res.redirect("/login");
//       }
//     );
//   });
// });

router.post("/register", (req, res, next) => {
  try {
    const { salt, hash } = genPassword(req.body.password);
    db.query(
      "INSERT INTO users (username, hash, salt) VALUES ($1, $2, $3)",
      [req.body.username, hash, salt],
      (err, result) => {
        if (err) {
          console.error("Error inserting user into database", err);
          return res.status(500).send("Internal Server Error");
        }
        // const user = result.rows[0];
        // console.log({ users: user });
        // res.status(201).json({ user: user });
        res.redirect("/login");
      }
    );
  } catch (err) {
    console.error("Error generating password hash", err);
    return res.status(500).send("Internal Server Error");
  }
});
/**
 * -------------- GET ROUTES ----------------
 */

router.get("/", (req, res, next) => {
  res.send(`
    <style>
     .container{
     display: grid;
    justify-items: center;
    align-items: center;
    height: 80vh;
     background: red;
     }
    
    </style>
    
    
    <div class="container" > <h1>Home</h1><p>Please <a href="/register">register</a></p></ > `);
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get("/login", (req, res, next) => {
  const form = `  <style>
     .container{
     display: grid;
    justify-items: center;
    align-items: center;
    height: 80vh;
    background: red;
     }
    
    </style>
    
    
    <div class="container" > <h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="username">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form> </div>`;

  res.send(form);
});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get("/register", (req, res, next) => {
  const form = `
     <style>
     .container{
     display: grid;
    justify-items: center;
    align-items: center;
    height: 80vh;
     background: red;
     padding: 20xp 50px;
     }
    
    </style>
    
    
    <div class="container" > 
    
    <h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="username">\
                    <br>Enter Password:<br><input type="password" name="password">\
                    <br><br><input type="submit" value="Submit"></form> </div>`;

  res.send(form);
});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 *
 * Also, look up what behaviour express session has without a maxage set
 */
router.get("/protected-route", (req, res, next) => {
  // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
  if (req.isAuthenticated()) {
    res.send(
      '<h1>You are authenticated</h1><p><a href="/logout">Logout and reload</a></p>'
    );
  } else {
    res.send(
      '<h1>You are not authenticated</h1><p><a href="/login">Login</a></p>'
    );
  }
});

// Visiting this route logs the user out
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/protected-route");
});

router.get("/login-success", (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
  );
});

router.get("/login-failure", (req, res, next) => {
  res.send("You entered the wrong password.");
});

module.exports = router;
