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
    pins: [{ type: Schema.Types.ObjectId, ref: "Pin", required: true }],
    id: {
      type: String,
      sparse: true,
      unique: true
    }
  },
  pinned: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
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
UserSchema.statics.authenticate = function (username, password, callback) {

  User.findOne({ "local.username": username })
    .exec((error, user) => {
      if (error) {
        return callback(error);
      }
      if (!user) {
        let error = new Error("User not found");
        error.status = 401;
        return callback(error);
      }
 
      bcrypt.compare(password, user.local.password, function (error, match) {
        if (match) {
          return callback(null, user);
        } else if (error) {
          return next(error);
        } else {
          let error = new Error("Credentials don't match");
          error.status = 401;
          return callback(error);
        }
      });
    });
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