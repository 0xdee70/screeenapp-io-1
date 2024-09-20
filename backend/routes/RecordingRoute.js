const express = require('express');
const router = express.Router();
const multer = require('multer');
const RecordingController = require('../controller/RecordingController');
const upload = multer(); 


router.post('/recordings', upload.fields([
  { name: 'webcamVideo', maxCount: 1 },
  { name: 'screenVideo', maxCount: 1 }
]), RecordingController.recordCon);

module.exports = router;
