const express = require("express");
const passport = require("passport");
const { originalRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");
const router = express.Router();

router
  .route("/signup")
  .get(userController.signupForm)
  .post(userController.createUser);

router
  .route("/login")
  .get(userController.loginForm)
  .post(
    originalRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/user/login",
      failureFlash: true,
    }),
    userController.loginUser,
  );

router.get("/logout", userController.logoutUser);

module.exports = router;
