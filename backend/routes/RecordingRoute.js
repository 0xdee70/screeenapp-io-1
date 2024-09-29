const express = require('express');
const router = express.Router();
const multer = require('multer');
const RecordingController = require('../controller/RecordingController');
const authMiddleware = require('../middleware/recordingMiddleware');
const upload = multer();

router.post('/recordings', authMiddleware, upload.fields([
  { name: 'webcamVideo', maxCount: 10 },
  { name: 'screenVideo', maxCount: 10 }
]), RecordingController.recordCon);

router.get('/recordings', authMiddleware, RecordingController.getRecordings);



router.delete('/recordings/:id', authMiddleware, RecordingController.deleteRecording);

module.exports = router;
