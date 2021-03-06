/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();
const {newPasswordToDatabase, deletePasswordFromDb } = require("../public/helpers");
// const generatePassword = require("../public/scripts/generate_password");

module.exports = (db) => {

  // Routes to the "Main" page
  router.get("/", (req, res) => {
    // const organizationId = req.params.organization_id;
    db.query(`SELECT * FROM accounts`, [])
      .then(data => {
        console.log(data.rows);
        const userCookie = req.cookies["User"];
        const templateVars = { accounts:data.rows, userCookie };
        res.render("home",templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });


  router.get("/logout", (req, res) => { // for distinct user
    res.clearCookie("user_id");
    res.clearCookie("organizationId");
    return res.redirect("/");
  });




  // ROUT to insert new data
  router.post("/accounts/new", (req, res) => {
    // console.log("eeeeeeeeeeeee", req.body);
    const username = req.body.username;
    const category = req.body.category;
    const url = req.body.url;
    const created_at = req.body.created_at;
    const password = req.body.password;
    console.log("Account Info", username + category + url, created_at, password);
    const orgId = req.cookies.organizationId;
    newPasswordToDatabase(orgId, category, url, password, username, created_at)
      .then(data => {
        console.log(data.rows);
        // newPasswordToDatabase(orgId, req.body.category, req.body.url, req.body.password);
        res.send('This also worked! You can submit your own password');
      })
      .catch(err => {
        console.log("errrrrrrrrrrrrrrrrrrrrror", err);
        res
          .status(500)
          .json({ error: err.message });
      });
  });






  router.get("/:organization_id", (req, res) => {
    const organizationId = req.params.organization_id;
    // const organizationName = req.params.organization.name;
    db.query(`SELECT accounts.*, organization.name,  organization.owner  FROM accounts  JOIN organization ON accounts.organization_id = organization.id  WHERE organization.id = $1;`, [organizationId])
      .then(data => {
        const organizationName = data.rows[0].name;
        console.log(data.rows);
        console.log(organizationName);
        const templateVars = { accounts:data.rows, organizationName, organization_id:organizationId };
        res.render("accounts",templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  // Routes to the "Generate Password" page
  //! http://localhost:8080/new/3 (Directs the organization_id = 3 to the generatePasswordPage)
  router.get("/new/:organization_id", (req, res) => { // for distinct organization
    const organizationId = req.params.organization_id;
    db.query(`SELECT * FROM accounts WHERE organization_id = $1;`,[organizationId])
      .then(data => {
        console.log("Organization", data.rows);
        const templateVars = { accounts: data.rows, password: null, organizationId };
        res.render("generatePassword", templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:organization_id", (req, res) => {
    const organizationId = req.params.organization_id;
    // const organizationName = req.params.organization.name;
    db.query(`SELECT accounts.*, organization.name,  organization.owner  FROM accounts  JOIN organization ON accounts.organization_id = organization.id  WHERE organization.id = $1;`, [organizationId])
      .then(data => {
        const organizationName = data.rows[0].name;
        console.log(data.rows);
        console.log(organizationName);
        const templateVars = { accounts:data.rows, organizationName, organization_id:organizationId };
        res.render("accounts",templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  //!----------------------------------------------------------------
  //! http://localhost:8080/3/1 (Directs the organization_id = 3 with "user" 1)
  // router.get("/:organization_id/:owner", (req, res) => { // for distinct organization
  //   const organizationId = req.params.organization_id;
  //   const userId = req.params.owner;

  //   db.query(`SELECT accounts.*, organization.name, organization.owner
  //   FROM accounts
  //   JOIN organization ON accounts.organization_id = organization.id
  //   WHERE organization.id = $1
  //   AND ogrganization.owner = $2;`, [organizationId, userId])
  //     .then(data => {
  //       console.log("TEST1", data.rows);
  //       const templateVars = {  accounts: data.rows , organizationId, userId };
  //       res.render("index", templateVars);
  //     })
  //     .catch(err => {
  //       res
  //         .status(500)
  //         .json({ error: err.message });
  //     });
  // });

  // //~ user_id is actually owner?
  // router.post("/:organization_id/:owner", (req, res) => { // for distinct organization
  //   const organizationId = req.params.organization_id;
  //   const userId = req.params.owner;
  //   db.query(`SELECT accounts.*, organization.name, organization.owner
  //   FROM accounts
  //   JOIN organization ON accounts.organization_id = organization.id
  //   WHERE organization.id = $1
  //   AND organization.owner = $2;`, [organizationId, userId])
  //     .then(data => {
  //       console.log("TEST2", data.rows);
  //       // const password = generateRandomString();
  //       const templateVars = { accounts: data.rows , organizationId, userId };
  //       res.render("index", templateVars);
  //       // if we wanted account we do templateVars.password
  //     })
  //     .catch(err => {
  //       res
  //         .status(500)
  //         .json({ error: err.message });
  //     });
  // });

  //!----------------------------------------------------------------------------------------------------
  // Shows the .JSON of ALL accounts db files
  router.get("/accounts", (req, res) => {
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
  router.get("/user", (req, res) => { // /api/users/accounts
    db.query(`SELECT * FROM users;`)
      .then(data => {
        const users = data.rows;
        console.log(users);
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
  router.get("/user/:id", (req, res) => { // for distinct user
    const userId = req.params.id;
    db.query(`SELECT * FROM users WHERE id = $1;`,[userId])
      .then(data => {
        console.log("user!!", data.rows);
        const templateVars = { user: data.rows };
        // res.render(templateVars);
        res.json({ templateVars });
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  router.post("/user/:id", (req, res) => { // for distinct user
    const userId = req.params.id;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    db.query(`SELECT * FROM users WHERE id = $1;`,[userId])
      .then(data => {
        console.log("==========xx", data.rows);
        const templateVars = { user: data.rows, password, userId, name, email };
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
  //! Login/Set Cookie
  router.get("/login/:id", (req, res) => { // for distinct user
    const userId = req.params.id;
    console.log("userId", userId);

    db.query(`SELECT * FROM organization_users WHERE user_id = $1;`,[userId]) //! join emails

      .then(data => {
        console.log(data);
        console.log("user!!", data.rows);
        if (data.rows.length < 1) {
          console.log("Invalid ID!");

          return res.redirect("/");
        }
        // const templateVars = { user: data.rows };
        // res.render(templateVars);
        res.cookie("user_id", userId); // sets cookie
        // res.cookie("email", data.rows[0].email); // sets cookie //! join emails
        res.cookie("organizationId", data.rows[0].organization_id); // sets cookie
        res.redirect("/users/accounts");
      })
      .catch(err => {
        console.log("----------", err.message);
        res
          .status(500)
          .json({ error: err.message });
      });
  });

  return router;
};

