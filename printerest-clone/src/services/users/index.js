const express = require("express");
const UserSchema = require("../db/UsersSchema");
const {authorize} = require("../midllewares")
const PinModel = require("../db/PinsSchema")
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../cloudinary")

const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "pins",
    format: async (req, file) => "png" || "jpg",
    public_id: (req, file) => req.user.username + "_profile",
    transformation: [{ width: 400, height: 400, gravity: "face", crop: "fill" }],
  },
});

const cloudinaryMulter = multer({ storage: storage });

const passport = require("passport");
const {
  authenticate,
 
  refreshToken,
  schemavalidation,
  schemaLoginvalidation,
  generateJWT,generateRefreshJWT
} = require("../midllewares/tools");
const querytomongo = require("query-to-mongo")

 
const userRoute = express.Router();
//FACEBOOK LOG IN
userRoute.get("/facebookLogin", passport.authenticate("facebook", { scope: ["public_profile", "email"] }));

userRoute.get("/facebookRedirect", passport.authenticate("facebook"), async (req, res, next) => {
  try {
    
    res.status(200).redirect(`${process.env.FE_URL}/profile?token=${req.user.tokens.token}&refreshToken=${req.user.tokens.refreshToken}`);
  } catch (error) {
    next(error);
  }
});


userRoute.post("/register", async (req, res) => {
 const {error} =  schemavalidation.validate(req.body)
 if(error) return res.status(400).send(error.details[0].message)
 const EmailsExist = await UserSchema.findOne({ email:req.body.email})

 if (EmailsExist) return res.status(400).send('Email already exists')
 try {
    const user = new UserSchema({
        ...req.body,
        img:"https://icons-for-free.com/iconfiles/png/512/business+costume+male+man+office+user+icon-1320196264882354682.png"
        // img:"https://i.pinimg.com/280x280_RS/13/0c/44/130c448b429c9a75d93b1666d7d230c9.jpg"
      });
      const savedUser= await user.save();
      const refreshToken =  await generateRefreshJWT({_id:savedUser._id})
      const accessToken =  await generateJWT({_id:savedUser._id})
      res.status(201).send({tokens:{accessToken,refreshToken}})
 } catch (error) {
     res.status(400).send(error)
     
 }
});

userRoute.post("/login", async (req, res, next) => {
    const { email, password, username } = req.body;
      const {error} =  schemaLoginvalidation.validate(req.body)
     if(error) return res.status(400).send(error.details[0].message)
     const EmailsExist = await UserSchema.findOne({ email:req.body.email})
    if (!EmailsExist) return res.status(400).send("Email or password is wrong")
    try {

      const user = await UserSchema.findByCredentials(email, password, username);
      if (user) {
        const tokens = await authenticate(user);
        res.status(201).send({ ok: true, tokens});
      } else {
        const err = new Error("User with email and password not found");
        err.status = 401;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  });
  userRoute.post("/refreshToken", async (req, res, next) => {
    const oldRefreshToken = req.body.refreshToken;
    if (!oldRefreshToken) {
      const err = new Error("Refresh token missing");
      err.httpStatusCode = 400;
      next(err);
    } else {
      try {
        const newTokens = await refreshToken(oldRefreshToken);
        if (newTokens) {

          res.status(201).send({ ok: true, tokens: newTokens });
        } else {
          const err = new Error("Provided refresh tocken is incorrect");
          err.httpStatusCode = 403;
          next(err);
        }

        
      } catch (error) {
        next(error);
      }
    }
  });
  userRoute.get("/me", authorize,async (req, res, next) => {
    try {
     
      
   
      

      const userObject = req.user.toObject();
      delete userObject.password;
      delete userObject.refreshTokens;
      delete userObject.__v;
      res.send(userObject);
    } catch (error) {
      next(error);
      console.log(error)
    }
  });
  userRoute.get("/", authorize,async (req, res, next) => {
    try {
      // const query = querytomongo(req.query);// convert the url query to mongoose property
      // const total = await UserSchema.countDocuments(req.query.search && { $text: { $search: req.query.search } });// count number f documents in that collection
      // const users = await UserSchema.find(req.query.search &&  { username:{ $text: { $search: req.query.search }} })
      const users = await UserSchema.find()
      
    
     
      res.send(users);
    } catch (error) {
      next(error);
      console.log(error)
    }
  });
 

  userRoute.get("/:username/saved", authorize, async (req, res, next) => {
    try {
      if (req.user) {
        const user = await UserSchema.findOne({ username: req.params.username });
        if (user && req.user.username === user.username){
       
  
        const userObject = req.user.toObject();
        const querySaved = req.user.saved.map((_id) => {
            return { _id };
          });
    
        const followers = req.user.followers.length;
        const following = req.user.following.length;
        
       
        const saved = await PinModel.find({ $or: [...querySaved, { _id: null }] }).populate(
          "Pin",
          "saved"
        );
       
        const pins = await PinModel.find({ pinnedBy: req.user._id }).populate(
          "users",
          "-password -refreshTokens -email -followers -following -saved ,-username  "
        );
        const numPins = pins.length;
        delete userObject.refreshTokens;
      
        delete userObject.password;
        delete userObject.__v;
  
        res.send({ ...userObject, saved,  followers, following, numPins });
      } else {
        const error = new Error();
        error.httpStatusCode = 404;
        next(error);
      }
    }else{
      const error = new Error();
        error.httpStatusCode = 401;
        next(error);

    }
    } catch (error) {
      next(error);
    }
  });
  userRoute.post("/saved/:id", authorize, async (req, res, next) => {
    try {
      const pin = await UserSchema.findOne({ _id: req.user._id, saved: req.params.id });
  
      const modifiedUser = pin
        ? await UserSchema.findByIdAndUpdate(
            req.user.id,
            {
              $pull: { saved: req.params.id },
            },
            {
              new: true,
              useFindAndModify: false,
            }
          )
        : await UserSchema.findByIdAndUpdate(
            req.user.id,
            {
              $push: { saved: req.params.id },
            },
            {
              new: true,
              useFindAndModify: false,
            }
          );
  
      res.status(201).send(modifiedUser);
    } catch (error) {
      next(error);
    }
  });
  userRoute.post("/logOut", authorize, async (req, res, next) => {
    try {
      if (req.token) {
        req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== req.token);
        await req.user.save();
        
        res.status(201).redirect(`${process.env.FE_URL}/logIn`);
      } else {
        const err = new Error("Token not provided");
        err.status = 401;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  });
  
  userRoute.post("/logOutAll", authorize, async (req, res, next) => {
    try {
      req.user.refreshTokens = [];
      await req.user.save();
      res.status(201).redirect(`${process.env.FE_URL}/logIn`);
    } catch (error) {
      next(error);
    }
  });
module.exports = userRoute;
