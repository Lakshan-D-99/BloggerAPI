// Importiere Mongoose und erstelle Post Schema

const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
  },
  postTitle: {
    type: String,
    required: true,
  },
  postBody: {
    type: String,
  },
  postImage: {
    type: String,
  },
  postLikes: {
    type: Number,
    default: 0,
  },
  postComments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = model("Post", postSchema);
