const { Schema, model } = require("mongoose");
const PinSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
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
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment", required: true }],
    color:{type:String},
    description: {type: String},
    images: [{ type: String }],
    owner: [{ type: Schema.Types.ObjectId, required: true, ref: "User" }],

    categories: [
      {
        name: String,
      },
    ],
    likes:[ {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    liked_by_user:{type:Boolean, default:false},
    height:{type: Number,default:6000},
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

  },
  { timestamps: true }
);
const PinModel = model("Pin", PinSchema);
module.exports = PinModel;

