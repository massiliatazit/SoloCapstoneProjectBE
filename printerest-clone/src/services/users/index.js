const express = require("express");
const UserSchema = require("../db/Users");
const {authorize} = require("../midllewares")
const PinModel = require("../db/Pins")

const {
  authenticate,
  verifyJWT,
  refreshToken,
  schemavalidation,
  schemaLoginvalidation
} = require("../midllewares/tools");
const querytomongo = require("query-to-mongo")
const userRoute = express.Router();


userRoute.post("/register", async (req, res) => {
 const {error} =  schemavalidation.validate(req.body)
 if(error) return res.status(400).send(error.details[0].message)
 const EmailsExist = await UserSchema.findOne({ email:req.body.email})

 if (EmailsExist) return res.status(400).send('Email already exists')
 try {
    const user = new UserSchema({
        ...req.body,
      });
      const savedUser= await user.save();
      res.status(201).send(savedUser)
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
  userRoute.get("/", async (req, res, next) => {
    try {
      const query = querytomongo(req.query);// convert the url query to mongoose property
      const total = await UserSchema.countDocuments(req.query.search && { $text: { $search: req.query.search } });// count number f documents in that collection
      const users = await UserSchema.find(req.query.search && { $text: { $search: req.query.search } })
        .sort({ createdAt: -1 })
        .skip(query.options.skip)
        .limit(query.options.limit)
        .select("-password -refreshTokens -email -followers -following -saved");
      const links = query.links("/users", total);
      res.send({ users, links, total });
    } catch (error) {
      next(error);
    }
  });

  userRoute.get("/:username/saved", authorize, async (req, res, next) => {
    try {
      if (req.user) {
        req.user;
        const userObject = req.user.toObject();
        const querySaved = req.user.saved.map((_id) => {
            return { _id };
          });
    
        const followers = req.user.followers.length;
        const following = req.user.following.length;
        
       
        const saved = await PinModel.find({ $or: [...querySaved, { _id: null }] }).populate(
          "users",
          "-password -refreshTokens -email -followers -following -saved -puts "
        );
       
        const pins = await PinModel.find({ owner: req.user._id }).populate(
          "users",
          "-password -refreshTokens -email -followers -following -saved -puts "
        );
        const numPins = pins.length;
        delete userObject.refreshTokens;
        delete userObject.followers;
        delete userObject.following;
        delete userObject.password;
        delete userObject.__v;
  
        res.send({ ...userObject, saved,  followers, following, numPins });
      } else {
        const error = new Error();
        error.httpStatusCode = 404;
        next(error);
      }
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
