const express = require('express')
const UserSchema = require('../db/Pins')
const pinRoute = express.Router()
pinRoute.post("/")
module.exports =pinRoute 