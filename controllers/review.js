const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../util/ExpressError");
const wrapAsync = require("../util/wrapAsync");

module.exports.createReview = wrapAsync(async (req, res) => {
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
});

module.exports.destroyReview = wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params; // assignment of id and reviewId depent on the path which one is placed first and which one later
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Review deleted ");
  console.log("Review Deleted");
  res.redirect(`/listing/${id}`);
});
