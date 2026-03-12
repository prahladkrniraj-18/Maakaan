const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true })); //parses the data from request body and converts it into a JavaScript object.

app.use(express.json()); //parses the data from request body and converts it into a JavaScript object. (for parsing json data sent in request body, not for parsing form data)

app.use(express.static(path.join(__dirname, "public"))); //for serving static files like css, images, js

const methodOverride = require("method-override");
app.use(methodOverride("_method")); //to override method in forms with PATCH, DELETE (as forms only support GET and POST)

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate); //for using ejs-mate layouts and partials

const wrapAsync = require("./util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const ExpressError = require("./util/ExpressError.js"); //custom error class to create error objects with status code and message

const { listingSchema } = require("./schema.js"); //for validating the data sent in request body for creating and updating listing

const Listing = require("./models/listing.js");
const mongo_URL = "mongodb://127.0.0.1:27017/maakaan";

main()
  .then(() => {
    console.log("Connected to DataBase");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_URL);
}

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  console.log(error);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(","); //to get all the error messages in a single string
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

app.delete(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const deletedListing = await Listing.deleteOne({ _id: id });
    console.log("Listing Deleted");
    console.log(deletedListing);
    res.redirect("/listing");
  }),
);

app.put(
  "/listing/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body || !req.body.listing) {
      throw new ExpressError(400, "Send valid data for  listing!");
    }
    let { id } = req.params;

    await Listing.updateOne({ _id: id }, req.body.listing).then(() => {
      console.log("Listing Updated");
      res.redirect(`/listing/${id}`);
    });
  }),
);

//create Route for creating new listing
app.post(
  "/listing/new",
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

    // if (!req.body || !req.body.listing) {
    //   throw new ExpressError(400, "Send valid data for creating listing!");
    // }

    const newListing = new Listing(req.body.listing); //directly passing the form data object
    if (!newListing.image || !newListing.image.url) {
      newListing.image = {
        filename: "listingimage",
        url: "https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg",
      };
    }
    await newListing.save();
    console.log("New Listing Created");
    res.redirect("/listing");
  }),
);

app.get("/listing/new", (req, res) => {
  res.render("listing/new.ejs");
});

app.get(
  "/listing/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    // console.log(id);
    let listing = await Listing.findById(id);
    // console.log(listing);
    res.render("listing/show.ejs", { listing });
  }),
);

app.get(
  "/listing/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listing/edit.ejs", { listing });
  }),
);

app.get(
  "/listing",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    // console.log(allListings);
    res.render("listing/index.ejs", { allListings });
  }),
);

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

app.get("/", (req, res) => {
  res.send("Han ji! Root server eetthe");
});

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message }); //if we send response here, then the next middlewares will not run as response is already sent.
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
