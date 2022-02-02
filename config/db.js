// Mongoose und Config Importieren
const mongoose = require("mongoose");
const config = require("config");

// DB Schlüssel
const key = config.get("MongoUrl");

// DB Verbindung erstellen
const connectDB = async () => {
  try {
    mongoose.connect(key);
    console.log(`Successfully connected to the Database`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
