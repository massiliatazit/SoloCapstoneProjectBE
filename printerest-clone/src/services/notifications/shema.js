const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const Notification = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    to: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    action: {
      type: String,
      enum: ["liked your pin", "left a comment", "started following you","saved your pin", "tagged you"],
    },
    post: { type: Schema.Types.ObjectId, ref: "Pins" },
    viewed: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", Notification);
