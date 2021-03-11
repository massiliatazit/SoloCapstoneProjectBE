const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  local: {
    email: {
      type: String,
      unique: true,
      trim: true
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    password: {
      type: String
    }
  },
  facebook: {
    username: {
      type: String,
      sparse: true
    },
    profileType: { default: "Personal", enum: ["Personal", "Business"], type: String },
    token: {
      type: String,
      sparse: true,
      unique: true
    },
    saved: [{ type: Schema.Types.ObjectId, ref: "SavedPins", required: true }],
    id: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  likes: {
    type: [Schema.Types.ObjectId],
    default: []
  }
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

  module.exports = mongoose.model("Users", UserSchema);