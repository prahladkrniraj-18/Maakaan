const User = require("../models/user");
const wrapAsync = require("../util/wrapAsync");

module.exports.signupForm = (req, res) => {
  res.render("./users/signup.ejs");
};

module.exports.createUser = wrapAsync(async (req, res) => {
  try {
    let { email, username, password } = req.body;
    let newUser = new User({ username, email });
    let registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "User Created Successfully, Welcome to MAAKAAN");
      console.log(registeredUser);
      res.redirect("/listing");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/user/signup");
  }
});

module.exports.loginForm = (req, res) => {
  res.render("./users/login.ejs");
};

module.exports.loginUser = async (req, res) => {
  req.flash("success", "Welcome to Maakaan, You are logged In!");
  const redirectUrl = req.session.redirectUrl || "/listing";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listing");
  });
};
