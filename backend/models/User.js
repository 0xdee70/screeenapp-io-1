const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  githubId: { type: String, unique: true, sparse: true },
  googleId: { type: String, unique: true, sparse: true },
  microsoftId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['user', 'admin', 'master_admin', 'pro_user'], default: 'user', required: true },
  isActive: { type: Boolean, default: true },
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  avatarUrl: { type: String },
  isProUser: { type: Boolean, default: false }
});

// Hash the password before saving only if it's set and modified
userSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check if the user is authenticated via OAuth
userSchema.methods.isOAuthUser = function () {
  return !!(this.githubId || this.googleId || this.microsoftId);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// If registration failed, use the below command in MongoDB shell:
// db.users.dropIndex("username_1")
