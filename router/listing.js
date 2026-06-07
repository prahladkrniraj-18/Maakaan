const express = require("express");
const router = express.Router();

const { cloudinary, storage } = require("../cloudConfig.js");

const multer = require("multer");
const upload = multer({ storage });

const wrapAsync = require("../util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listing.js");

//Route for rendering form to edit listing
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

//Route for showing all listings
router.get("/", wrapAsync(listingController.index));

//create Route for creating new listing
//Route for rendering form to create new listing
router
  .route("/new")
  .post(
    isLoggedIn,
    validateListing,
    upload.single("listing[image][url]"),
    listingController.createListing,
  )
  .get(isLoggedIn, listingController.renderNewForm);

//Route for showing details of a listing
//Route for updating a listing
//Route for deleting a listing
router
  .route("/:id")
  .get(listingController.showListing)
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    validateListing,
    listingController.updateListing,
  )
  .delete(isLoggedIn, isOwner, listingController.deleteListing);

module.exports = router;
