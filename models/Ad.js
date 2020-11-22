const mongoose = require("mongoose");
const slufigy = require("slugify");
const { getImageURL, readSellsOnAd } = require("../utils/acqDataOnPages");

const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  slug: String,
  url: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      "Please use a valid URL with HTTP or HTTPS",
    ],
    unique: [true, "Please add a URL that isn't already stored"],
  },
  sells: [Number],
  visits: [Number],
  totalSells: {
    type: Number,
    default: 0,
  },
  totalVisits: {
    type: Number,
    default: 0,
  },
  conversionRate: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  imageURL: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Adding a Mongoose Middleware to create the slug before saving to DB
AdSchema.pre("save", async function (next) {
  this.slug = slufigy(this.name, { lower: true });
  this.imageURL = await getImageURL(this.url);
  this.totalSells = await readSellsOnAd(this.url);
  console.log(this.imageURL);
  next();
});

module.exports = mongoose.model("Ad", AdSchema);
