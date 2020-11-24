const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const Ad = require("../models/Ad");

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token && req.cookies.token.startsWith("Bearer")) {
    token = req.cookies.token.split(" ")[1];
  }

  // make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  // validate token
  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

exports.user = asyncHandler(async (req, res, next) => {
  let ad = await Ad.findById(req.params.id);
  // check if user is ad owner or admin
  if (ad.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} not authorized to update this ad`,
        401
      )
    );
  }
  next();
});
