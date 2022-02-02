const router = require("express").Router();

const User = require("../models/User");
const Post = require("../models/Post");

const { compare } = require("bcryptjs");

const authM = require("../middlewares/authM");

// method -> Update an existing User
// route -> /users/:id
// privateRoute -> true
router.put("/users/:id", authM, async (req, res) => {
  // First get the Data from the Body
  const { firstName, lastName, birthDate, email, password } = req.body;

  try {
    // First check if a user exists with the given credentials
    let user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ msg: "A User doesn't exists with the given credentials" });
    }

    // Check if the Password match or not
    let isMatch = await compare(password, isUser.password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ msg: "A User doesn't exists with the given credentials" });
    }

    // Assig the new Values
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthDate) user.birthDate = birthDate;
    if (email) user.email = email;
    if (password) user.password = password;

    // Create an updated user
    let newUser = await user.save();

    // Lastly send a respond
    return res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error !!! Please try again later" });
  }
});

// method -> Delete an existing User
// method -> /users/:id
// privateRoute -> true
router.delete("/users/:id", authM, async (req, res) => {
  try {
    // First get the User and check if the User exists
    let isUser = await User.findById(req.params.id);

    if (!isUser) {
      return res
        .status(404)
        .json({ msg: " A User doesn't exists with the given credentials " });
    }

    // Delete all the Posts from the User
    await Post.deleteMany({ user: req.user.id });

    // Lastly remove the User
    await User.findOneAndRemove({ _id: req.user.id });

    return res.status(200).json({ msg: "Successfully removed the User" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Server Error !!! Please try again later" });
  }
});

module.exports = router;
