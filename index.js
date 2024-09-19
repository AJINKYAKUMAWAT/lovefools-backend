const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./dbconfig/dbConfig");

const app = express();
app.use(
  cors({
    origin: "http://your-frontend-url.com", // replace with the frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"], // specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // specify allowed headers
  })
);

app.use(bodyParser.json());

// Import User routes
const userRoutes = require("./routes/Routes");
app.use("/api/user", userRoutes);

app.listen(5000, () => {
  console.log("This server is running on port 5000");
});
