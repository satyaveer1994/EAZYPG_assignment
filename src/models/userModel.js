const mongoose = require("mongoose");


let userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    
    isDeleted: {
      type: Boolean,
      default: false
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EAZYPG", userSchema);
