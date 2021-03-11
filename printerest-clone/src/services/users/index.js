const express = require("express");
const UserSchema = require("../db/Users");
const Joi = require('@hapi/joi')
const {
  authenticate,
  verifyJWT,
  refreshToken,
  schemavalidation,
  schemaLoginvalidation
} = require("../midllewares/tools");
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
     res.status(400).send(err)
     
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
        res.status(201).send({ ok: true, tokens });
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
  
module.exports = userRoute;
