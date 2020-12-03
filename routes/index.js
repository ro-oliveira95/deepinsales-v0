const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/auth");

// instantiate express-router
const router = express.Router();

router.post("/deleteAd", (req, res) => {
  const data = req.body;

  const itemID = data.itemID;

  console.log(itemID);

  const options = { proxy: { host: "127.0.0.1", port: 5000 } };

  let token = "";

  axios
    .delete(`/api/v1/ads/${itemID}`, options)
    .then((response) => {
      console.log("sucess");
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
