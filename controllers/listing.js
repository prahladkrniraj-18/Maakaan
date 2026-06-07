const Listing = require("../models/listing");
const { listingSchema } = require("../schema");
const ExpressError = require("../util/ExpressError");
const wrapAsync = require("../util/wrapAsync");

const ACCESS_TOKEN = process.env.MAP_TOKEN;

const mbxgeoencoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxgeoencoding({ accessToken: ACCESS_TOKEN });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  // console.log(allListings);
  res.render("listing/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.showListing = wrapAsync(async (req, res) => {
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
});

module.exports.renderEditForm = wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are trying to access does not exist!");
    return res.redirect("/listing");
  }
  originalImage = listing.image.url;
  originalImage = originalImage.replace("/upload", "/upload/w_300");
  res.render("listing/edit.ejs", { listing, originalImage });
});

module.exports.createListing = wrapAsync(async (req, res, next) => {
  const geocodingResponse = await geocodingClient
    .forwardGeocode({
      query: `${req.body.listing.location}, ${req.body.listing.country}`,
      limit: 1,
    })
    .send();
  const result = listingSchema.validate(req.body);
  if (result.error) {
    throw new ExpressError(400, result.error);
  }

  const newListing = new Listing(req.body.listing); //directly passing the form data object

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    newListing.image = { filename, url };
  }
  newListing.owner = req.user._id;
  newListing.geometry = geocodingResponse.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing created successfully!"); //to set a flash message with key "success" and value "New listing created successfully!"
  console.log("New Listing Created");
  console.log(newListing);
  res.redirect("/listing");
});

module.exports.updateListing = wrapAsync(async (req, res) => {
  let { id } = req.params;

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, {
    new: true,
  });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = { filename, url };
    await updatedListing.save();
    console.log("Listing Updated");
  }
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listing/${id}`);
});

module.exports.deleteListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  const deletedListing = await Listing.findOneAndDelete({ _id: id });
  console.log("Listing Deleted"); // This will delete the listing with the given id from the database
  console.log(deletedListing);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listing");
});
