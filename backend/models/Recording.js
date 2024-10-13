const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  webcamVideo: String,
  screenVideo: String,
  uploaded: String,
  // Removed thumbnail field
  title: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;
