const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

// instantiate express-router
const router = express.Router();

router.get("/login", isAuthenticated, (req, res) => {
  res.render("login");
});

router.post("/login", (req, res) => {
  const data = req.body;
  const options = { proxy: { host: "127.0.0.1", port: 5000 } };

  let token = "";

  axios
    .post("/api/v1/auth/login", data, options)
    .then((response) => {
      token = `Bearer ${response.data.token}`;

      res.cookie("token", token);
      res.redirect("/");
    })
    .catch((err) => {
      console.log("erro de login");

      res.redirect("/login");
    });
});

router.post("/register", (req, res) => {
  const data = req.body;
  const options = { proxy: { host: "127.0.0.1", port: 5000 } };

  let token = "";

  axios
    .post("/api/v1/auth/register", data, options)
    .then((response) => {
      token = `Bearer ${response.data.token}`;

      res.cookie("token", token);
      res.redirect("/");
    })
    .catch((err) => {
      console.log("erro de registro");

      res.redirect("/login");
    });
});

router.get("/logout", (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.redirect("/login");
});

router.get("/", isNotAuthenticated, (req, res) => {
  const user = req.user.name;
  res.render("index", { user });
});

function isNotAuthenticated(req, res, next) {
  protect(req, res, function () {
    if (!req.user) {
      return res.redirect("/login");
    }
    return next();
  });
}

function isAuthenticated(req, res, next) {
  protect(req, res, function () {
    if (req.user) {
      return res.redirect("/");
    }
    return next();
  });
}

module.exports = router;
