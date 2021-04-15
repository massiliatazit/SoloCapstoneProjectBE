const { Schema, model, Model } = require("mongoose");


const RoomSchema = new Schema({
  name: {
    type: String,
    
  },
  participants:[{  type: Schema.Types.ObjectId, ref: "Users" }],

  chatHistory: [
    {
      sender: { type: String },
      text: { type: String },
      createdAt: { type: String },
     
    },
  ],
  images: {
    type: String,
  },
});
module.exports = model("Room",RoomSchema)