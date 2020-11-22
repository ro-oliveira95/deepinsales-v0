// importing files and controller methods
const express = require("express");
const {
  getAds,
  getAd,
  createAd,
  updateAd,
  deleteAd,
  adImageUpload,
} = require("../controllers/ads");

const { protect, user } = require("../middleware/auth");

// instantiate express-router
const router = express.Router();

// create routes for the endpoints
router.route("/").get(protect, getAds).post(protect, createAd);
router
  .route("/:id")
  .get(protect, user, getAd)
  .put(protect, user, updateAd)
  .delete(protect, user, deleteAd);
router.route("/:id/image").put(protect, user, adImageUpload);

module.exports = router;
