// Importiere Express und initialisiere den Router von Express
const router = require("express").Router();

// Importiere User,Post und Comment Schema
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

// Importiere andere Module
const { check, validationResult, body } = require("express-validator");

// Importiere den Auth Middleware
const authM = require("../middlewares/authM");

// method : Alle Posts die existieren 
// route  : /allPosts
// privateRoute : false
router.get("/allPosts", async (req, res) => {
  try {
    
    let allPosts = await Post.find();

    if (allPosts.length <= 0) {
      return res
        .status(202)
        .json({ msg: "There are currently no Posts to show" });
    }

    return res.status(200).json(allPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error !!!" });
  }
});

// method : Eigene Posts
// route  : /allPosts/:id
// privateRoute : true
router.get("/allPosts/:id", authM, async (req, res) => {
  try {
    // Überprüfe ob der User bereits mit den gegebenn Informationen existiert ?
    let isUser = await User.findById(req.params.id);

    if (!isUser) {
      return res.status(404).json({ msg: "User doesn't exists" });
    }

    // Alle posts des Users
    let allUserPosts = await User.findById(req.params.id).populate("posts");

    // Hat der User posts ?
    if (allUserPosts.length <= 0) {
      return res.status(202).json({ msg: "This User does't have any Posts" });
    }

    return res.status(200).json(allUserPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

// method: Erstelle eine neues Post
// route: /allPosts/newPost
// privateRoute: true
router.post(
  "/allPosts/newPost",
  [authM, check("postTitle", "Please enter your Post Title").not().isEmpty()],
  async (req, res) => {
    // Überprüfe,ob irgendwelche Errors vorliegt
    const isErrors = validationResult(req.body);

    if (!isErrors.isEmpty()) {
      return res.status(404).json({ isErrors: isErrors.array() });
    }

    // Nimm die User Data aus dem req.body raus
    const { postTitle, postBody, postImage } = req.body;

    try {
      // zuerst nimm den User
      const user = await User.findById(req.user.id).select("-password");

      // Überprüfe ob der User bereits mit den gegebenn Informationen existiert ?
      if (!user) {
        return res
          .status(404)
          .json({ msg: "A User doesn't exists with the given crdentials" });
      }

      // Erstelle ein neues Post
      const newPost = new Post({
        user: req.user.id,
        name: user.firstName,
        postTitle,
        postBody,
        postImage,
      });

      // Als letzes speichert den Post
      const post = await newPost.save();

      return res.status(200).json(post);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ msg: "Internal Server Error !!! Please try again later" });
    }
  }
);

// method: ändere ein Post
// route: /allPosts/updatePost/:id
// privateRoute: true
router.put("/allPosts/updatePost/:id", [authM], async (req, res) => {
  // Nimm die User Data aus dem req.body raus
  const { postTitle, postBody, postImage } = req.body;

  try {
    // Überprüfe ob der User bereits mit den gegebenn Informationen existiert ?
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User doesn't exists with the given credentials " });
    }

    // Ruf den Post auf und überprüfe ob er existiert
    const post = await Post.findById(req.post.id);

    if (!post) {
      return res.status(404).json({ msg: "This Post doesn't exists" });
    }

    // Neue Daten zuordnen
    if (postTitle) post.postTitle = postTitle;
    if (postBody) post.postBody = postBody;
    if (postImage) post.postImage = postImage;

    // Neue Post speichern
    const result = await post.save();

    return res.status(200).json(result);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Error !!! Please try again later" });
  }
});

// method: Lösche ein Post
// route: /allPosts/deletePost/:id
// privateRoute: true
router.delete("/allPosts/deletePost/:id", authM, async (req, res) => {
  try {
    // Ruf den Post auf und überprüfe ob er existiert
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "This Post doesn't exists" });
    }

    // Löscht den Post
    await post.remove();

    return res
      .status(200)
      .json({ msg: "This Post has been successfully removed" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Internal Error !!! Please try again later" });
  }
});

// method: Like ein Post
// route: /allPosts/like/:id
// privateRoute: true
router.put("/allPosts/like/:id", authM, async (req, res) => {
  try {
    // Ruf den Post auf und überprüfe ob er existiert
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "This Post doesn't exists" });
    }

    // Überprüfe ob der Post bereits als Like markiert ist ?
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.status(200).json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal Error !!! Please try again later");
  }
});

// method: Kommentiere ein Post
// route: /allPosts/comment/:id
// privateRoute: true
router.put(
  "/allPosts/comment/:id",
  [
    authM,
    check("commentBody", "Please enter your comment to continue")
      .not()
      .isEmpty(),
  ],
  async (req, res) => {
    // Überprufe,ob irgendwelche Errors vorliegt
    const errors = validationResult(req.body);

    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    }

    // Nimm die User Data aus dem req.body raus
    const { commentBody } = req.body;

    try {
      // Ruf den user auf
      const user = await User.findById(req.params.id).select("-password");

      // Ruf den Post auf
      const post = await Post.findById(req.params.id);

      // Überprüfe ob den User und Posts bereits existieren ?
      if (!user && !post) {
        return res.status(404).json({ msg: "Informations doesn't exists" });
      }

      // Erstelle eine neues Kommentar
      const comment = new Comment({
        user: req.user.id,
        post: req.post.id,
        name: req.user.name,
        commentBody,
      });

      // Speichert den Kommentar ins Datenbank
      await comment.save();

      return res.status(200).json(comment);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ msg: "Internal Error !!! Please try again later" });
    }
  }
);

module.exports = router;
