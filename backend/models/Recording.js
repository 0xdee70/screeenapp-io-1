const mongoose = require('mongoose');


const recordingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  webcamVideo: String, 
  screenVideo: String, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = Recording;
