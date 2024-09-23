const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  webcamVideo: Buffer,
  screenVideo: Buffer,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;
