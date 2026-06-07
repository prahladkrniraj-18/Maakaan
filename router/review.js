const express = require("express");
const router = express.Router({ mergeParams: true }); //to access the params of parent router (listing router) in this review router mergeParams is set to true

const wrapAsync = require("../util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const ExpressError = require("../util/ExpressError.js"); //custom error class to create error objects with status code and message

const {
  validateReview,
  isLoggedIn,
  isReviewauthor,
} = require("../middleware.js");

const reviewContoller = require("../controllers/review.js");

//review
//post review request
router.post("/", isLoggedIn, validateReview, reviewContoller.createReview);

//review
//to delete reviews
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewauthor,
  reviewContoller.destroyReview,
);

module.exports = router;
