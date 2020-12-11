// import modules
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cron = require("node-cron");

const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const { updateSellsOnAllUsers } = require("./utils/dailyCalls");

// load env vars
dotenv.config({ path: "./config/config.env" });

// connect to DB
connectDB();

// route files
const ads = require("./routes/ads");
const auth = require("./routes/auth");
const login = require("./routes/login");
const index = require("./routes/index");

// init app
const app = express();

// body parser - needed to pass JSON content on the body of the requisition
app.use(express.json({ limit: "10mb" }));

// cookie parser
app.use(cookieParser());

// body parser to receive form data in req.body
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// setting the view engine
app.set("view engine", "ejs");

// dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// file uploading for images
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// mount routers
app.use("/api/v1/ads", ads);
app.use("/api/v1/auth", auth);
app.use("/", login);
app.use("/index", index);

// custom errorHandler middleware
app.use(errorHandler);

// scheduling daily calls
cron.schedule("*/30 * * * *", () => {
  d = new Date();
  console.log(`[${d.toGMTString()}] calling dailly functions...`);
  updateSellsOnAllUsers();
});

// handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`[ERROR] ${err.message}`.red.bold);
  // close server & exit process
  server.close(() => process.exit(1));
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
