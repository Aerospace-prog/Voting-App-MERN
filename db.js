const mongoose = require('mongoose');
require('dotenv').config();


//Define the MongoDb connection URL
//const mongoURL = process.env.MONGODB_URL_LOCAL; // This is locall hosted Database

const mongoURL = process.env.MONGODB_URL_LOCAL; //This is online cloud hoted DB

//Set Up mongoDb conenction

mongoose.connect(mongoURL ,{
    useNewUrlParser: true, // This ensures that the above is new URL
    useUnifiedTopology: true // This ensures that the above is unified topology (Unified topology is a new connection management engine that improves the way connections are handled in MongoDB.)
})

//Get a default connection
//Mongoose maintains a default connection object representing the mongoDB connection.
//And by bewlo db we are gonnae establish the bridge between node and mongoDb
const db = mongoose.connection;

//Define Event Listners for database connection

db.on('connected', ()=>{
    console.log('Connected to MongoDB');
})

db.on('error' , (error)=>{
    console.log('MongoDb conenction error',error);
})

db.on('disconnected' , ()=>{
    console.log('MongoDb Disconnected');
})

 //Export the database connection

 module.exports = db;