const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

// instantiate express-router
const router = express.Router();

router.get("/login", (req, res) => {
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
      res.redirect("/index");
    })
    .catch((err) => {
      console.log("erro de login");

      res.redirect("/login");
    });
});

router.get("/index", protect, (req, res) => {
  const user = req.user.name;
  res.render("index", { user });
});

module.exports = router;
