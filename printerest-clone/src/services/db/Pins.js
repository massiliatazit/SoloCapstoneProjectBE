const {Schema,model} = require('mongoose')
const PinSchema = new Schema({
    username:{type:String,required:true},
    title: {
        type: String,
        required: true
      },
      address: {
        type: String
      },
      link: {
        type: String
      },
      views: {
        type: Number,
        default: 0
      },
      owner: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      category: {
        name: String},
      likes: {
        type: Number,
        default: 0
      },
      pinnedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
      





},
{ timestamps: true }
) ;
const PinModel = model('Pin',PinSchema)
module.exports = PinModel