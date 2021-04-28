const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const StorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    categories:[{type:String}],
    description:{type:String},
    title: {
      type: String,
      required: true,
    },
    images:[ {
      type: String,
      required: false,
    }],
    video: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      min: 10,
      max: 30,
      default: 10,
    },
    exclude: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
  },
  { timestamps: true }
);
const StoryModel= 
mongoose.model("Story", StorySchema);
module.exports = StoryModel;