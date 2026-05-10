const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose"); //to hash and salt the password and also to add some methods to the user model for authentication:
const passportLocalMongoosePlugin =
  passportLocalMongoose.default || passportLocalMongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoosePlugin);

module.exports = mongoose.model("User", userSchema);
