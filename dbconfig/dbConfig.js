const mongoose = require("mongoose");
const dbConnection = () => {
  try {
    mongoose
      .connect("mongodb://localhost:27017/")
      .then(() => {
        console.log("connection successfully run");
      })
      .catch(() => console.log("connection error"));
  } catch (error) {
    console.log(error);
  }
};

dbConnection();
