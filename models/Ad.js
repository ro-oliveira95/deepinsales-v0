const mongoose = require("mongoose");
const slufigy = require("slugify");
const { getImageURL, readSellsOnAd } = require("../utils/acqDataOnPages");
const {
  getAdDataFromId,
  getMlAdIDFromURL,
  getAdVisitsFromId,
  getSellerNicknameFromSellerId,
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
  price: Number,
  isBuybox: { type: Boolean, default: false },
  catalogueId: { type: String, default: "" },
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

// Custom validator that checks the uniqueness of ad's url of the current user
AdSchema.pre("validate", async function (next) {
  const fullURL = new URL(this.url);
  let url = fullURL.origin + fullURL.pathname;

  const userAds = await this.constructor.find({ user: this.user });

  let testFullURL, testURL;

  userAds.forEach((ad) => {
    testFullURL = new URL(ad.url);
    testURL = testFullURL.origin + testFullURL.pathname;

    if (testURL === url) {
      console.log("Erro!");

      const err = new Error("Duplicated base URL");
      return next(err);
    }
  });

  next();
});

AdSchema.pre("save", async function (next) {
  adInfo = await getMlAdIDFromURL(this.url);

  this.mlId = adInfo.mlId;
  this.catalogueId = adInfo.catalogueId;
  this.isBuybox = adInfo.isBuybox;

  adInfo = await getAdDataFromId(this.mlId);
  adVisits = await getAdVisitsFromId(this.mlId);

  this.seller = await getSellerNicknameFromSellerId(adInfo[0].seller_id);
  this.price = adInfo.price;

  if (this.name === "") {
    this.name = adInfo[0].title;
  }
  this.slug = slufigy(this.name, { lower: true });

  this.acumulatedVisits = [{ timestamp: this.createdAt, visits: 0 }];
  this.acumulatedSells = [{ timestamp: this.createdAt, sells: 0 }];
  this.dailyVisits = [{ timestamp: this.createdAt, visits: 0 }];
  this.dailySells = [{ timestamp: this.createdAt, sells: 0 }];

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
