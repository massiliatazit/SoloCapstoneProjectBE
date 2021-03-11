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
      category: {
        name: String},
      likes: {
        type: Number,
        default: 0
      },
      saved: [{ type: Schema.Types.ObjectId, ref: "SavedPins", required: true }],





},
{ timestamps: true }
) ;
const Pin = model('Pin',PinSchema)
module.exports = Pin