const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI

async function connectToMongo(){
  mongoose.connection.on('connected', () => console.log('connected'));
  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectToMongo;