const express = require("express");
const router = express.Router({ mergeParams: true }); //to access the params of parent router (listing router) in this review router mergeParams is set to true

const listing = require("./listing.js");

const wrapAsync = require("../util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const ExpressError = require("../util/ExpressError.js"); //custom error class to create error objects with status code and message

const Review = require("../models/review.js");

const Listing = require("../models/listing.js");

const {
  validateReview,
  isLoggedIn,
  isReviewauthor,
} = require("../middleware.js");

//review
//post review request
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Review added ");
    console.log("new review saved");
    res.redirect(`/listing/${listing._id}`);
  }),
);
//review
//to delete reviews
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewauthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params; // assignment of id and reviewId depent on the path which one is placed first and which one later
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Review deleted ");
    console.log("Review Deleted");
    res.redirect(`/listing/${id}`);
  }),
);

module.exports = router;
