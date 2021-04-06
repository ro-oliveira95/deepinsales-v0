const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

// instantiate express-router
const router = express.Router();

router.get("/login", isAuthenticated, (req, res) => {
  const { errorLogin, errorRegister, showRegisterWindow } = req.session;

  req.session.errorLogin = null;
  req.session.errorRegister = null;
  req.session.showRegisterWindow = null;

  res.render("login", { errorLogin, errorRegister, showRegisterWindow });
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

router.get("/", protect, (req, res) => {
  const { errorAddingAd } = req.session;

  // req.session.errorAddingAd = null;

  // console.log("entrou aqui");

  const user = req.user.name;
  res.render("index", { error: null, user });
  // res.render("index");
});

function isAuthenticated(req, res, next) {
  let token;
  if (req.cookies.token && req.cookies.token.startsWith("Bearer")) {
    token = req.cookies.token.split(" ")[1];
  }

  // make sure token exists
  if (token) {
    return res.redirect("/");
  }
  return next();
}

module.exports = router;
