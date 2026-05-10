const mongoose = require("mongoose");
const initData = require("./data");
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
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "69fdbe6a3278613e602d2d3f",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was intialized");
};

initDB();
