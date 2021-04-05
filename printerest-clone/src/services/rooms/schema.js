const { Schema, model } = require("mongoose");


const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "Users" },
      socketId: { type: String },
    },
  ],
  chatHistory: [
    {
      sender: { type: String },
      text: { type: String },
      createdAt: { type: String },
      attachment: { type: String },
    },
  ],
  images: {
    type: String,
  },
});