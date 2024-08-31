const mongoose = require("mongoose");
const dbConnection = () => {
  try {
    mongoose
      .connect(
        "mongodb+srv://Ganesh:LoveFools@cluster0.l5cec9x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/LoveFools"
      )
      // .connect("mongodb://localhost:27017/")
      .then(() => {
        console.log("connection successfully run");
      })
      .catch((error) => console.log("connection error", error));
  } catch (error) {
    console.log(error);
  }
};

dbConnection();
