const express = require("express");
const app = express();
const mongoose = require("mongoose");

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const session = require("express-session");

const flash = require("connect-flash");

const sessionConfig = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: Date.now() + 7 * 24 * 60 * 60 * 1000, //7 days
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    httpOnly: true, //to prevent client side scripts from accessing the cookie
  },
};
app.use(session(sessionConfig)); //to use sessions in our app, it will add a session object to the request object and also set a cookie in the browser with the session id.

app.use(flash()); //to use flash messages in our app, it will add a flash function to the request object which can be used to set flash messages and also add a flash object to the response locals which can be used to access the flash messages in the views.

app.use(express.urlencoded({ extended: true })); //parses the data from request body and converts it into a JavaScript object.

app.use(express.json()); //parses the data from request body and converts it into a JavaScript object. (for parsing json data sent in request body, not for parsing form data)

app.use(express.static(path.join(__dirname, "public"))); //for serving static files like css, images, js
const methodOverride = require("method-override");
app.use(methodOverride("_method")); //to override method in forms with PATCH, DELETE (as forms only support GET and POST)

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate); //for using ejs-mate layouts and partials

const wrapAsync = require("./util/wrapAsync.js"); //to wrap (*only*) => async functions and catch errors in them

const ExpressError = require("./util/ExpressError.js"); //custom error class to create error objects with status code and message

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

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

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
