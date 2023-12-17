const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password:{
    type:String,
    required: true,
    
  }
  // Add more fields as needed (e.g., profile picture, age, etc.)
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;