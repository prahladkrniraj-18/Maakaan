const express = require("express");
const router = express.Router();

const wrapAsync = require("../util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const { reviewSchema } = require("../review_schema.js");

const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

// app.get("/listTesting", async (req, res) => {
//   let newListing = new Listing({
//     title: "Raj Villa",
//     description: "villa in mountains",
//     price: 2100,
//     location: "Mangali, HP",
//     country: "India",
//   });
//   await newListing
//     .save()
//     .then(() => {
//       console.log("Saved to DB");
//       res.send("Saved");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

//Route for deleting a listing
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.findOneAndDelete({ _id: id });
    console.log("Listing Deleted"); // This will delete the listing with the given id from the database
    console.log(deletedListing);
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listing");
  }),
);

//Route for updating a listing
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body || !req.body.listing) {
      throw new ExpressError(400, "Send valid data for  listing!");
    }
    let { id } = req.params;

    await Listing.updateOne({ _id: id }, req.body.listing).then(() => {
      console.log("Listing Updated");
      req.flash("success", "Listing updated successfully!");
      res.redirect(`/listing/${id}`);
    });
  }),
);

//create Route for creating new listing
router.post(
  "/new",
  isLoggedIn,
  validateListing,
  wrapAsync(async (req, res, next) => {
    // const { title, description, image, price, location, country } = req.body;
    // const newListing = new Listing({
    //   title: title,
    //   description: description,
    //   image: { url: image },
    //   price: price,
    //   location: location,
    //   country: country,
    // });

    const result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
      throw new ExpressError(400, result.error);
    }

    const newListing = new Listing(req.body.listing); //directly passing the form data object
    if (!newListing.image || !newListing.image.url) {
      newListing.image = {
        filename: "listingimage",
        url: "https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg",
      };
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New listing created successfully!"); //to set a flash message with key "success" and value "New listing created successfully!"
    console.log("New Listing Created");
    res.redirect("/listing");
  }),
);

//Route for rendering form to create new listing
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listing/new.ejs");
});

//Route for showing details of a listing
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // console.log(id);
    let listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author", //nested popul;ate for author
        },
      })
      .populate("owner");
    if (!listing) {
      req.flash("error", "Listing you are trying to access does not exist!");
      return res.redirect("/listing");
    }
    // console.log(listing);
    res.render("listing/show.ejs", { listing });
  }),
);

//Route for rendering form to edit listing
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you are trying to access does not exist!");
      return res.redirect("/listing");
    }
    res.render("listing/edit.ejs", { listing });
  }),
);

//Route for showing all listings
router.get(
  "/",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listing/index.ejs", { allListings });
  }),
);

module.exports = router;
