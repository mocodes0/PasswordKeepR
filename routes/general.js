/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

const generateRandomString = function() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};


module.exports = (db) => {
  // Routes to the "Main" page
  router.get("/", (req, res) => {
    db.query(`SELECT * FROM accounts;`)
      .then(data => {
        console.log(data.rows);
        const templateVars = {accounts:data.rows};
        res.render("index",templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // Routes to the "Generate Password" page
  router.get("/new/:organization_id", (req, res) => { // for distinct organization
    const organizationId = req.params.organization_id;
    db.query(`SELECT * FROM accounts WHERE organization_id = $1;`,[organizationId])
      .then(data => {
        console.log("==========xx", data.rows);
        const templateVars = { accounts: data.rows, password: null, organizationId };
        res.render("generatePassword", templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/generate/:organization_id", (req, res) => { // for distinct organization
    const organizationId = req.params.organization_id;
    const username = req.body.username;
    const url = req.body.url;
    const category = req.body.category;
    db.query(`SELECT * FROM accounts WHERE organization_id = $1;`,[organizationId])
      .then(data => {
        console.log("==========xx", data.rows);
        const password = generateRandomString();
        const templateVars = { accounts: data.rows, password, organizationId, username, url, category };
        res.render("createAccount", templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // Shows the .JSON of the accounts db files
  router.get("/accounts", (req, res) => { // /api/users/accounts
    db.query(`SELECT * FROM accounts;`)
      .then(data => {
        const accounts = data.rows;
        res.json({ accounts });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // shows the .JSON of the users db files
  router.get("/users", (req, res) => { // /api/users/accounts
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        res.json({ users });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // TODO Login GET/POST set a cookie with cookie parser
  // Routes to login 1 user
  router.get("/users/:id", (req, res) => { // for distinct user
    const userId = req.params.id;
    db.query(`SELECT * FROM users WHERE id = $1;`,[userId])
      .then(data => {
        console.log("user!!", data.rows);
        const templateVars = { users: data.rows };
        // res.render(templateVars);
        res.json({ templateVars });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/users/:id", (req, res) => { // for distinct user
    const userId = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    db.query(`SELECT * FROM users WHERE id = $1;`,[userId])
      .then(data => {
        console.log("==========xx", data.rows);
        const templateVars = { users: data.rows, password, userId, name, email };
        // res.render(templateVars);
        res.json({ templateVars });
        // if we wanted account we do templateVars.password
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  return router;
};

