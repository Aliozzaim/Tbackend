const fs = require("fs")
const path = require("path")

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const placesRoutes = require("./routes/places-routes")
const usersRoutes = require("./routes/users-routes")
const HttpError = require("./models/http-error")

const app = express()
const PORT = process.env.PORT || 5000

app.use(bodyParser.json())

// Serving static images
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
)

// CORS handling
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  )
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE")
  next()
})

// Routes
app.use("/api/places", placesRoutes)
app.use("/api/users", usersRoutes)

// Handling unknown routes
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404)
  next(error)
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (req.file && req.file.path) {
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err)
      }
    })
  }
  if (res.headersSent) {
    return next(error)
  }
  const statusCode = error.code >= 400 && error.code < 600 ? error.code : 500
  const errorMessage = error.message || "An unknown error occurred!"
  if (error.code === "ENOENT") {
    console.error("File not found:", error.message)
    res.status(statusCode).json({ message: "File not found." })
  } else {
    res.status(statusCode).json({ message: errorMessage })
  }
})

// Connect to MongoDB and start server
mongoose
  .connect(
    `mongodb+srv://deneme1:b4WGHHGfcgBM6tfX@cluster.zhzo7lx.mongodb.net/places?retryWrites=true&w=majority&appName=Cluster`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })
