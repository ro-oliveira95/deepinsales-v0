const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Ad = require("../models/Ad");

// @desc     Get all ads
// @route    GET /api/v1/ads
// @access    Public
exports.getAds = asyncHandler(async (req, res, next) => {
  let query;

  // copying req.query
  let reqQuery = { ...req.query };

  // if user is admin gets all of then, else gets only ads specific of the user
  if (req.user.role !== "admin") {
    reqQuery = { ...req.query, user: req.user.id };
  }

  //console.log(reqQuery)

  // defining fields to be removed from the query
  const removeFields = ["select", "sort", "page", "limit"];

  // loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // create query string
  let queryStr = JSON.stringify(reqQuery);

  // create special operators ($gt, $lte etc) from the query
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // finding resource
  query = Ad.find(JSON.parse(queryStr));

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" "); // mongoose requires a string with space between params
    query = query.select(fields);
  }

  // Sort resources
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // default sort
    query = query.sort("-conversionRate");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 99999;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Ad.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // executing query
  const ads = await query;

  // pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // sending the response
  res
    .status(200)
    .json({ success: true, count: ads.length, pagination, data: ads });
});

// @desc      Get single ad
// @route     GET /api/v1/ads/:id
// @access    Public
exports.getAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(
      new ErrorResponse(`Ad not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: ad });
});

// @desc      Create ad
// @route     POST /api/v1/ads
// @access    Private
exports.createAd = asyncHandler(async (req, res, next) => {
  // add user to req.body
  req.body.user = req.user.id;

  const ad = await Ad.create(req.body);

  res.status(201).json({ success: true, data: ad });
});

// @desc      Update ad
// @route     PUT /api/v1/ads/:id
// @access    Private
exports.updateAd = asyncHandler(async (req, res, next) => {
  // let ad = await Ad.findById(req.params.id);

  // update ad
  ad = await Ad.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!ad) {
    return next(
      new ErrorResponse(`Ad not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: ad });
});

// @desc      Delete ad
// @route     DELETE /api/v1/ads/:id
// @access    Private
exports.deleteAd = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findByIdAndDelete(req.params.id);

  if (!ad) {
    return next(
      new ErrorResponse(`Ad not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload image for Ad
// @route     PUT /api/v1/ads/:id/image
// @access    Private
exports.adImageUpload = asyncHandler(async (req, res, next) => {
  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(
      new ErrorResponse(`Ad not found with id of ${req.params.id}`, 400)
    );
  }

  // no file in the request
  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const file = req.files.file;

  // check if it is an image
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image file", 400));
  }

  // check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom filename
  file.name = `image_${ad._id}${path.parse(file.name).ext}`;

  // move the image file to the upload path and update DB
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse("Problem with file upload", 500));
    }

    await Ad.findByIdAndUpdate(req.params.id, { image: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
});
