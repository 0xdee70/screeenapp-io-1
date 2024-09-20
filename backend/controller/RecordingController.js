const Recording = require("../models/Recording"); 
const User = require('../models/User')

const recordCon = async (req, res) => {
  try {
    const webcamVideo = req.files["webcamVideo"][0];
    const screenVideo = req.files["screenVideo"][0];

    const userEmail = req.body.usermail;

    const mail = await User.findOne({email:userEmail}) ;

    const newRecording = new Recording({

      userId:mail._id,
      webcamVideo: webcamVideo.buffer.toString("base64"), 
      screenVideo: screenVideo.buffer.toString("base64"), 
    });

    await newRecording.save();

    res.status(201).json({ message: "Recording created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { recordCon };
