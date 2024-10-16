const express = require('express');
const router = express.Router();
const multer = require('multer');
const RecordingController = require('../controller/RecordingControllerMongo');
const recordingMiddleware = require('../middleware/recordingMiddlewareMongo');
const upload = multer();

router.post('/recordings', recordingMiddleware, upload.fields([
  { name: 'webcamVideo', maxCount: 10 },
  { name: 'screenVideo', maxCount: 10 },
]), RecordingController.recordCon);

router.post('/recordings/upload', recordingMiddleware, upload.fields([
  { name: 'uploaded', maxCount: 10 }
]), RecordingController.recordConUpload);

// Removed the thumbnails route
// router.get('/recordings/thumbnails/:thumbnailName', RecordingController.getThumbnail);

router.get('/recordings', recordingMiddleware, RecordingController.getRecordings);

router.delete('/recordings/:id', recordingMiddleware, RecordingController.deleteRecording);

router.get('/recordings/stream/:key', recordingMiddleware, RecordingController.streamVideo);

router.get('/recordings/check/:key', recordingMiddleware, RecordingController.checkVideoExists);

const logRequest = (req, res, next) => {
  console.log(`Received ${req.method} request for ${req.originalUrl}`);
  next();
};

router.get('/recordings/download/:id', logRequest, recordingMiddleware, RecordingController.downloadRecording);

module.exports = router;
