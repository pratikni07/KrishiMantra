// index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");

const reelRoutes = require("./routes/reelRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Sample auth middleware
// const authMiddleware = (req, res, next) => {
//   // For testing purposes, we'll simulate a logged-in user
//   req.user = {
//     userId: 'user123',
//     userName: 'John Doe',
//     profilePhoto: 'https://example.com/photo.jpg'
//   };
//   next();
// };

// Routes

app.use("/reels", reelRoutes);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     status: "error",
//     message: err.message || "Internal server error",
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Handle Mongoose Connection Events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to database");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
