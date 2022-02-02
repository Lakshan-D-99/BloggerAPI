// Importiere Express und initialisiere den Router von Express
const express = require("express");
const router = express.Router();

// Importiere den User Schema
const User = require("../models/User");

// Importiere den Auth Middleware
const authM = require("../middlewares/authM");

// Importiere andere Module
const { check, validationResult, body } = require("express-validator");
const { genSalt, hash, compare } = require("bcryptjs");
const key = require("config").get("JwtKey");
const { sign } = require("jsonwebtoken");

// Route -> Erstelle eine neues User Account
router.post(
  "/register", // Überprüfe,ob irgendwelche Errors vorliegt
  check("firstName", "Please enter your First Name to continue")
    .not()
    .isEmpty(),
  check("lastName", "Please enter your Last Name to continue").not().isEmpty(),
  check("birthDate", "Please enter your Birth-Date to continue")
    .not()
    .isEmpty(),
  check("email", "Please enter your Email Address to continue").not().isEmail(),
  check(
    "password",
    "Please enter a Password with more than 8 Characters to continue"
  )
    .not()
    .isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(404).json(errors.array());
    }

    // Nimm die User Data aus dem req.body raus
    const { firstName, lastName, birthDate, email, password } = req.body;

    try {
      // Überprüfe ob ein User bereits mit den gegebenn Informationen existiert ?
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          msg: "A User already exists with the given credentials, please use other credentials to register",
        });
      }

      // Erstelle ein neues User
      let newUser = new User({
        firstName,
        lastName,
        birthDate,
        email,
        password,
      });

      // Passwort encodieren
      const salt = await genSalt(12);
      newUser.password = await hash(password, salt);

      // neue user speichern
      await newUser.save();

      // Als letzes JWT Token in Headers initialisieren 
      const payload = {
        user: {
          id: user.id,
        },
      };

      sign(payload, key, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

// Route -> User anmelde 
router.post(
  "/logIn", // Überprüfe,ob irgendwelche Errors vorliegt
  [
    authM,
    check("email", "Please enter your credentials to continue").isEmail(),
    check("password", "Please enter your credentials to continue").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      return res.status(404).json(errors.array());
    }

    // Nimm die User Data aus dem req.body raus
    const { email, password } = req.body;

    // trycatch block
    try {
      // Überprüfe ob ein User bereits mit den gegebenn Informationen existiert ?
      let isUser = await User.findOne({ email });
      if (!isUser) {
        return res.status(404).json({
          msg: "A User doesn't exists with the given credentials, please use your correct credentials to log in",
        });
      }

      // Überprüfe,ob die Passwörter stimmen ?
      const isMatch = await compare(password, isUser.password);
      if (!isMatch) {
        return res.status(404).json({
          msg: "A User doesn't exists with the given credentials, please use your correct credentials to log in",
        });
      }

      const payload = {
        user: {
          id: isUser.id,
        },
      };

      sign(payload, key, { expiresIn: "5 days" }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
