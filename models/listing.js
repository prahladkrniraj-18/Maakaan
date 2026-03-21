const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg?_gl=1*1exui5u*_ga*MTg5Mzg3OTY1My4xNzY0OTU2OTUw*_ga_8JE65Q40S6*czE3NjQ5NTY5NTAkbzEkZzEkdDE3NjQ5NTcyMTAkajU5JGwwJGgw",
    },
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    const Review = require("./review"); //  lazy import
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
