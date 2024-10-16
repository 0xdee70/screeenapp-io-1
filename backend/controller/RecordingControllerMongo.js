const Recording = require('../models/Recording');
const User = require('../models/User');

const recordCon = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    const webcamVideos = req.files["webcamVideo"] || [];
    const screenVideos = req.files["screenVideo"] || [];
    const title = req.body.title;

    if (webcamVideos.length === 0 && screenVideos.length === 0) {
      return res.status(400).json({ message: "No video files uploaded" });
    }

    const recordings = [];
    for (let i = 0; i < Math.max(webcamVideos.length, screenVideos.length); i++) {
      const newRecording = new Recording({
        userId: user._id,
        webcamVideo: webcamVideos[i] ? webcamVideos[i].buffer : null,
        screenVideo: screenVideos[i] ? screenVideos[i].buffer : null,
        title: title
      });
      recordings.push(newRecording);
    }

    await Recording.insertMany(recordings);

    res.status(201).json({ message: "Recordings created successfully", recordings });
  } catch (error) {
    console.error("Error in recordCon:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const recordConUpload = async (req, res) => {
  try {
    console.log("Entering recordConUpload");
    console.log("req.userId:", req.userId);
    console.log("req.headers:", req.headers);
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    // Check if req.userId exists
    if (!req.userId) {
      console.error("User ID is missing from the request");
      return res.status(401).json({ message: "User authentication failed" });
    }

    const userId = req.userId;

    const uploaded = req.files["uploaded"] || [];
    const titles = req.body["title"] || [];

    if (uploaded.length === 0) {
      return res.status(400).json({ message: "No video files uploaded" });
    }

    const recordings = [];

    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i];
      const blobName = `${userId}-${Date.now()}-${file.originalname}`;

      const newRecording = new Recording({
        userId: userId,
        uploadedKey: blobName,
        title: titles || `Uploaded Video ${i + 1}`,
      });
      recordings.push(newRecording);
    }

    await Recording.insertMany(recordings);

    res.status(201).json({ message: "Recordings created successfully", recordings });
  } catch (error) {
    console.error("Error in recordConUpload:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



const getRecordings = async (req, res) => {
  try {
    const userId = req.userId;
    const recordings = await Recording.find({ userId });
    res.status(200).json(recordings);
  } catch (error) {
    console.error("Error in getRecordings:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
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

const streamVideo = async (req, res) => {
  try {
    const { key } = req.params;
    const recording = await Recording.findOne({ uploadedKey: key });
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    res.setHeader('Content-Type', 'video/webm');
    res.setHeader('Content-Length', recording.size);
    res.send(recording.webcamVideo);
  } catch (error) {
    console.error("Error in streamVideo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkVideoExists = async (req, res) => {
  try {
    const { key } = req.params;
    const recording = await Recording.findOne({ uploadedKey: key });
    if (!recording) {
      return res.status(404).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (error) {
    console.error("Error in checkVideoExists:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const downloadRecording = async (req, res) => {
  try {
    const { key } = req.params;
    const recording = await Recording.findOne({ uploadedKey: key });
    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${key}"`);
    res.setHeader('Content-Type', 'video/webm');
    res.send(recording.webcamVideo);
  } catch (error) {
    console.error("Error in downloadRecording:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  recordCon,
  recordConUpload,
  getRecordings,
  deleteRecording,
  streamVideo,
  checkVideoExists,
  downloadRecording
};
