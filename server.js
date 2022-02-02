// Importiere Express und definiere den App Variable
const express = require("express");
const app = express();

// Importiere andere Module
const config = require("config");
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("logger");

// initialisiere den Express.JSON middleware
app.use(express.json());

// initialisiere den CORS
app.use(cors());

// Importiere den Datenbank verbindung
const connectDB = require("./config/db");
connectDB();

// Routes Importieren
const authRoute = require("./routes/auths");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");

// Routes Definiere
app.use("/api_v1/auths", authRoute);
app.use("/api_v1/users", userRoute);
app.use("./api_v1/posts", postRoute);

// Port definieren
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on PORT:${port}`);
});
