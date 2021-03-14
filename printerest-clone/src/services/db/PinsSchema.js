const { Schema, model } = require("mongoose");
const PinSchema = new Schema(
  {
    username: { type: String, required: true },
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    link: {
      type: String,
      download:String,
      download_location:String
    },
    views: {
      type: Number,
      default: 0,
    },
    color:{type:String},
    description: {type: String},
    imgURL: [{ type: String }],
    owner: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],
    saved: [{ type: Schema.Types.ObjectId, required: true, ref: "Pin" }],
    categories: [
      {
        name: String,
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    liked_by_user:{type:Boolean, default:false},
    height:{type: Number,default:6000},
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String, title: String }],
  },
  { timestamps: true }
);
const PinModel = model("Pin", PinSchema);
module.exports = PinModel;

