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

const Review = require("./models/review.js");

const listing = require("./router/listing.js");
const review = require("./router/review.js");

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

app.use("/listing", listing);
app.use("/listing/:id/reviews", review); //to use review router for all routes starting with /listing/:id/reviews

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
