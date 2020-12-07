const mongoose = require("mongoose");
const slufigy = require("slugify");
const { getImageURL, readSellsOnAd } = require("../utils/acqDataOnPages");
const { getAdDataFromId, getMlAdIDFromURL } = require("../utils/callToML");

const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
  },
  slug: String,
  adId: String,
  imageUrl: String,
  listingType: String,
  status: String,
  url: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
    unique: [true, "Please add a URL that isn't already stored"],
  },
  acumulatedSells: [{ timestamp: Date, sells: Number }],
  acumulatedDVisits: [{ timestamp: Date, sells: Number }],
  dailySells: [{ timestamp: Date, sells: Number }],
  dailyVisits: [{ timestamp: Date, sells: Number }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Adding a Mongoose Middleware to create the slug before saving to DB
AdSchema.pre("save", async function (next) {
  this.slug = slufigy(this.name, { lower: true });
  this.adId = await getMlAdIDFromURL(this.url);

  adInfo = await getAdDataFromId(this.adId);

  if (this.name === "") {
    this.name = adInfo.name;
  }

  this.imageUrl = adInfo.secure_thumbnail;
  this.listingType = adInfo.listing_type_id;
  this.status = adInfo.status;

  //this.imageURL = await getImageURL(this.url);
  //this.totalSells = await readSellsOnAd(this.url);

  next();
});

module.exports = mongoose.model("Ad", AdSchema);
