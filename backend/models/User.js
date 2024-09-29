const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  githubId: { type: String, unique: true, sparse: true },
  password: {
    type: String,
    required: function () {
      return !this.githubId;
    }
  },
  role: { type: String, enum: ['user', 'admin', 'master_admin'], required: true },
  username: { type: String },
  isActive: { type: Boolean, default: true },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false }
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;




// if registration failed use the below 
// db.users.dropIndex("username_1")
