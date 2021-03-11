const express = require('express')
const UserSchema = require('../db/Users')
const userRoute = express.Router()
userRoute.post("/")
module.exports =userRoute