const Listing = require("./models/listing");
const Review = require("./models/review");
const { reviewSchema } = require("./review_schema"); //
const { listingSchema } = require("./schema"); //for validating the data sent in request body for creating and updating listing
const ExpressError = require("./util/ExpressError"); //custom error class to create error objects with status code and message

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create/modify Listing/Review");
    return res.redirect("/user/login");
  }
  next();
};

module.exports.originalRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.originalUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are trying to access does not exist!");
    return res.redirect("/listing");
  }

  if (!listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of this Listing");
    return res.redirect(`/listing/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //to get all the error messages in a single string
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //to get all the error messages in a single string
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewauthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review you are trying to access does not exist!");
    return res.redirect(`/listing/${id}`);
  }

  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the owner of this Review");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
