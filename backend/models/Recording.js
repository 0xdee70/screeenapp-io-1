const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  webcamVideo: Buffer,
  screenVideo: Buffer,
  uploadedKey: String,
  title: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  size: Number,
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;
