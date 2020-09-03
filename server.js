var express = require('express');
var bodyParser = require('body-parser');
var passport =  require('passport');
const cookieParser = require('cookie-parser');
var cors = require('cors');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 8080;

//initialize app with express
const app = require('express')();
app.use(cors())
app.use(cookieParser());
//Passport middleware
app.use(passport.initialize())

// parse middle ware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const server = require('http').createServer(app)
const io = require('socket.io')(server);

//connecting to database
// const mongo_uri = `mongodb://localhost/${PORT}`;
// const mongo_uri = `mongodb://localhost/${PORT}`;
const mongo_uri =  `mongodb+srv://dbJackie:Jackie654321@chat-app-cluster-tqqdk.gcp.mongodb.net/test?retryWrites=true&w=majority`
mongoose.connect(mongo_uri, {autoIndex: false, useNewUrlParser: true, useUnifiedTopology: true}).then(
  ()=> console.log(`Successfully connected to ${mongo_uri}`)
).catch(err=> console.log(err))

//require models
require('./models/User');
require('./models/profile');

//Passport config
require('./config/passport')(passport);

//routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const chatrooms = require('./routes/api/chatrooms')(io);
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/chatrooms', chatrooms);

server.listen(PORT, function(){
  console.log(`server is running on port ${PORT}`)
});

