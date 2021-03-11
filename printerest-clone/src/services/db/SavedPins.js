const {Schema,model} = require('mongoose')
const SavedPinSchema = new Schema({
   
      category: {
        name: String},
        description: {type:String},
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
          },
          followers: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
          following: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
      




},
{ timestamps: true }
) ;
const Pin = model('SavedPin',SavedPinSchema)
module.exports = Pin