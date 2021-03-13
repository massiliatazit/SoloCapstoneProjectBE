const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  
    email: {
      type: String,
      unique: true,
      trim: true,
      max:255,
      min:6
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      min:3
    },
    password: {
      type: String,
      required: true, 
      max:1024,
      min:4
    }
  ,
  facebookId: 
   {type: String},
    profileType: { default: "personal", enum: ["personal", "business"], type: String },
   
    followers: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    following: [{ type: Schema.Types.ObjectId, ref: "Users", required: true }],
    
  saved: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
  likes: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  refreshTokens: [{ token: { type: String, required: true } }],
},
{ timestamps: true }
);

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

UserSchema.statics.findByCredentials = async function (email, password, username) {
  const user = await this.findOne({ $or: [{ email }, { username }] });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.statics.findByUserName = async function (username) {
  const user = await this.findOne({ username }).populate("pins");
  if (user) {
    const followers = user.followers.length;
    const following = user.following.length;
    const numpins = user.pins.length;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;
    delete userObject.refreshTokens;
    delete userObject.followers;
    delete userObject.following;
    
    const data = { ...userObject, followers, numpins, following };
    return data;
  } else {
    return null;
  }
};

UserSchema.pre("validate", async function (next) {
    const user = this;
    const plainPW = user.password;
    const facebook = user.facebookId;
    facebook || plainPW ? next() : next(new Error("No password provided"));
  });
  
  UserSchema.pre("save", async function (next) {
    const user = this;
    const plainPW = user.password;
  
    if (user.isModified("password")) {
      user.password = await bcrypt.hash(plainPW, 10);
    }
    next();
  });
  UserSchema.statics.changePassword = async function (userId, oldPassword, newPassword) {
    const user = await this.findById(userId);
    if (user) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (isMatch) {
        user.password = newPassword;
        user.save();
        return true;
      } else return false;
    } else {
      return false;
    }
  };
  module.exports = mongoose.model("Users", UserSchema);