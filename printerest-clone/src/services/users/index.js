const express = require("express");
const UserSchema = require("../db/Users");
const Joi = require('@hapi/joi')
const {
  authenticate,
  verifyJWT,
  refreshToken,
  schemavalidation,
} = require("../midllewares/tools");
const userRoute = express.Router();
userRoute.post("/register", async (req, res) => {
 const {error} =  schemavalidation.validate(req.body)
 if(error) return res.status(400).send(error.details[0].message)
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
module.exports = userRoute;
