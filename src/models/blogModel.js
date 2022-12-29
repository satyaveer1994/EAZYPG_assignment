const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const blogModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: "title is required",
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      required: "body is required",
    },
    userId: {
      type: objId,
      required: "user id is required",
      ref: "user",
    },
    category: {
      type: [String],
      required: "category is required",
    },
    likes: {
        type: [
          {
            type: mongoose.Schema.ObjectId,
            ref: "user",
          },
        ],
        default: [],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
    
    isDeleted: { type: Boolean, default: false },
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("E_blog", blogModel); // blogs