const jwt = require('jsonwebtoken');
const Recording = require("../models/Recording");
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const recordCon = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const webcamVideos = req.files["webcamVideo"] || [];
    const screenVideos = req.files["screenVideo"] || [];

    if (webcamVideos.length === 0 && screenVideos.length === 0) {
      return res.status(400).json({ message: "No video files uploaded" });
    }

    const recordings = [];

    for (let i = 0; i < Math.max(webcamVideos.length, screenVideos.length); i++) {
      const newRecording = new Recording({
        userId: user._id,
        webcamVideo: webcamVideos[i] ? webcamVideos[i].buffer : null,
        screenVideo: screenVideos[i] ? screenVideos[i].buffer : null,
      });
      recordings.push(newRecording);
    }

    await Recording.insertMany(recordings);

    res.status(201).json({ message: "Recordings created successfully" });
  } catch (error) {
    console.error("Error in recordCon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecordings = async (req, res) => {
  try {
    const userId = req.userId;
    const recordings = await Recording.find({ userId });

    res.status(200).json(recordings);
  } catch (error) {
    console.error("Error in getRecordings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRecording = async (req, res) => {
  try {
    const userId = req.userId;
    const recordingId = req.params.id;

    const recording = await Recording.findOne({ _id: recordingId, userId });
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    await Recording.deleteOne({ _id: recordingId });

    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRecording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { recordCon, getRecordings, deleteRecording };
