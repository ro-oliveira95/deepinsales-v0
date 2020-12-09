const mongoose = require("mongoose");
const slufigy = require("slugify");
const { getImageURL, readSellsOnAd } = require("../utils/acqDataOnPages");
const {
  getAdDataFromId,
  getMlAdIDFromURL,
  getAdVisitsFromId,
} = require("../utils/callToML");

const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: [true, "Please add an unused name"],
  },
  slug: String,
  mlId: String,
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
  acumulatedVisits: [{ timestamp: Date, visits: Number }],
  dailySells: [{ timestamp: Date, sells: Number }],
  dailyVisits: [{ timestamp: Date, visits: Number }],
  totalSells: Number,
  totalVisits: Number,
  rgb: [Number, Number, Number],
  category: String,
  seller: String,
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
  this.mlId = await getMlAdIDFromURL(this.url);

  adInfo = await getAdDataFromId(this.mlId);
  adVisits = await getAdVisitsFromId(this.mlId);

  if (this.name === "") {
    this.name = adInfo[0].title;
  }
  this.slug = slufigy(this.name, { lower: true });

  this.acumulatedVisits = [{ timestamp: this.createdAt, visits: 0 }];
  this.acumulatedSells = [{ timestamp: this.createdAt, sells: 0 }];
  this.dailyVisits = [{ timestamp: this.createdAt, visits: 0 }];
  this.dailySells = [{ timestamp: this.createdAt, sells: 0 }];

  // this.totalSells = adInfo[0].sold_quantity;
  this.totalSells = await readSellsOnAd(adInfo[0].permalink);
  this.totalVisits = adVisits[this.mlId];

  this.imageUrl = adInfo[0].secure_thumbnail;
  this.listingType = adInfo[0].listing_type_id;
  this.status = adInfo[0].status;

  this.rgb = [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
  ];

  next();
});

module.exports = mongoose.model("Ad", AdSchema);
