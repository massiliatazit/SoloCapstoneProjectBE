const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const {join} = require('path')
const server = express()
// const http = require('http')
// const httpServer = http.createServer(server)
const serviceRouters = require('./services')
const passport = require("passport");
const { notFoundHandler, forbiddenHandler, badRequestHandler, genericErrorHandler } = require("./errorHandlers");
const port = process.env.PORT ||7000 
const staticFolderPath = join(__dirname, '../public')

server.use(express.static(staticFolderPath))
server.use(express.json())
server.use(cors());

server.use(passport.initialize());
server.use("/", serviceRouters);
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(forbiddenHandler);
server.use(genericErrorHandler);
mongoose.connect(process.env.MONGO_CONNECTION,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex:true,
}).then(server.listen(port,()=>{
    console.log("Running on port", port,)
})).catch(err=>console.log(err))
