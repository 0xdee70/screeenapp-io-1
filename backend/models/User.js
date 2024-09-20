// // const mongoose = require("mongoose");

// // const userSchema = new mongoose.Schema({
// //   username: String,
// //   email: String,
// //   password: String,
// //   role: {
// //     type: String,
// //     default: "user",
// //   },
// // });

// // const User = mongoose.model("User", userSchema);

// // module.exports = User;

// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true
//     // minlength: 3,
//     // maxlength: 30
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
//   },
//   password: {
//     type: String,
//     required: function () { return this.authMethod === 'local'; },
//     minlength: 8
//   },
//   role: {
//     type: String,
//     enum: ['user', 'admin'],
//     default: "user",
//   },
//   authMethod: {
//     type: String,
//     enum: ['local', 'github', 'google', 'microsoft'],
//     required: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   lastLogin: {
//     type: Date
//   }
// }, {
//   timestamps: true
// });

// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 12);
//   }
//   next();
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// const User = mongoose.model("User", userSchema);

// module.exports = User;


// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  githubId: { type: String, unique: true, sparse: true },

  password: {
    type: String, required: function () {
      return !this.githubId;
    }
  },
  role: { type: String, enum: ['user', 'admin'], required: true },
  username: { type: String, }
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
