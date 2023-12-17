const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password:{
    type:String,
    required: true,
    
  }
  
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;