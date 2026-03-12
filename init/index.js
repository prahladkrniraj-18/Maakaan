const mongoose = require("mongoose");
const initdata = require("./data");
const Listing = require("../models/listing.js");

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

const initDB = async () => {
  await Listing.deleteMany();
  await Listing.insertMany(initdata.data);
  console.log("Data was intialized");
};

initDB();
