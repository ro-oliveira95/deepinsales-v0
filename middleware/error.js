const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // log to console for dev
  // console.log(err.error);

  // mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // mongoose duplicate key
  if ((err.name = "MongoError" && err.code === 11000)) {
    //const message = `Duplicate field value entered`;
    const message = ["E-mail já cadastrado, favor inserir outro."];
    error = new ErrorResponse(message, 400);

    req.session.errorRegister = message;
    req.session.showRegisterWindow = true;
    return res.redirect("/login");
  }

  // mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);

    req.session.errorRegister = message;
    req.session.showRegisterWindow = true;
    return res.redirect("/login");
  }

  if (err.message === "Duplicated base URL") {
    const message = "Anúncio com o mesmo URL já adicionado.";
    req.session.errorAddingAd = message;
    // return res.redirect("/");
    const user = req.user.name;
    // console.log("EEEEERRRRROOOOOO");
    res.locals.error = message;
    res.render("index", { error: message, user: "FUCKER" });
  }

  // res.status(error.statusCode || 500).json({
  //   success: false,
  //   error: error.message || "Server Error",
  // });
};

module.exports = errorHandler;
