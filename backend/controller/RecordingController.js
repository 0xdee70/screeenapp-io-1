const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const dotenv = require('dotenv');

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

const recordCon = async (req, res) => {
  try {
    const userId = req.userId;
    const webcamVideos = req.files["webcamVideo"] || [];
    const screenVideos = req.files["screenVideo"] || [];
    const title = req.body.title;

    if (webcamVideos.length === 0 && screenVideos.length === 0) {
      return res.status(400).json({ message: "No video files uploaded" });
    }

    const recordings = [];

    const webcamVideo = webcamVideos[0];
    const screenVideo = screenVideos[0];

    const timestamp = Date.now();
    const webcamBlobName = webcamVideo ? `${userId}-webcam-${timestamp}.webm` : null;
    const screenBlobName = screenVideo ? `${userId}-screen-${timestamp}.webm` : null;

    let totalSize = 0;

    if (webcamVideo) {
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: webcamBlobName,
        Body: webcamVideo.buffer,
        ContentType: webcamVideo.mimetype,
      }));
      totalSize += webcamVideo.size;
    }

    if (screenVideo) {
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: screenBlobName,
        Body: screenVideo.buffer,
        ContentType: screenVideo.mimetype,
      }));
      totalSize += screenVideo.size;
    }

    const recordingItem = {
      id: `${timestamp}-${Math.random().toString(36).substring(2, 15)}`,
      userId: userId,
      webcamVideoKey: webcamBlobName,
      screenVideoKey: screenBlobName,
      title: title,
      size: totalSize,
      createdAt: new Date().toISOString(),
    };

    console.log("Saving recording item:", recordingItem);

    await dynamoDB.send(new PutCommand({
      TableName: process.env.DYNAMODB_RECORDINGS_TABLE,
      Item: recordingItem
    }));

    res.status(201).json({
      message: "Recording created successfully",
      recording: {
        id: recordingItem.id,
        webcamVideoKey: recordingItem.webcamVideoKey,
        screenVideoKey: recordingItem.screenVideoKey,
        title: recordingItem.title,
        size: recordingItem.size,
        createdAt: recordingItem.createdAt
      }
    });
  } catch (error) {
    console.error("Error in recordCon:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const recordConUpload = async (req, res) => {
  try {
    console.log('recordConUpload called');
    console.log('req.userId:', req.userId);

    const userId = req.userId;
    console.log('userId:', userId);

    const uploaded = req.files["uploaded"] || [];
    console.log('uploaded files:', uploaded.length);

    const titles = req.body["title"] || [];
    console.log('titles:', titles);

    if (uploaded.length === 0) {
      return res.status(400).json({ message: "No video files uploaded" });
    }

    const recordings = [];

    for (let i = 0; i < uploaded.length; i++) {
      const file = uploaded[i];
      const blobName = `${userId}-${Date.now()}-${file.originalname}`;

      console.log(`Uploading file ${i + 1} to S3`);
      // Upload the video file to AWS S3
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: blobName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }));
      console.log(`File ${i + 1} uploaded to S3`);

      const recordingItem = {
        userId: userId,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        uploadedKey: blobName,
        title: titles || `Uploaded Video ${i + 1}`,
        createdAt: new Date().toISOString(),
      };

      console.log(`Saving recording ${i + 1} to DynamoDB`);
      console.log('DynamoDB Table Name:', process.env.DYNAMODB_RECORDINGS_TABLE);
      await dynamoDB.send(new PutCommand({
        TableName: process.env.DYNAMODB_RECORDINGS_TABLE,
        Item: recordingItem
      }));
      console.log(`Recording ${i + 1} saved to DynamoDB`);

      recordings.push(recordingItem);
    }

    res.status(201).json({ message: "Recordings created successfully", recordings });
  } catch (error) {
    console.error("Error in recordConUpload:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getRecordings = async (req, res) => {
  try {
    const userId = req.userId;

    const { Items } = await dynamoDB.send(new QueryCommand({
      TableName: process.env.DYNAMODB_RECORDINGS_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }));

    console.log("Retrieved items from DynamoDB:", Items);

    const recordingsWithUrls = await Promise.all(Items.map(async (item) => {
      let webcamUrl = null;
      let screenUrl = null;

      if (item.webcamVideoKey) {
        console.log("Generating signed URL for webcam video:", item.webcamVideoKey);
        webcamUrl = await getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: item.webcamVideoKey,
        }), { expiresIn: 3600 });
      }

      if (item.screenVideoKey) {
        console.log("Generating signed URL for screen video:", item.screenVideoKey);
        screenUrl = await getSignedUrl(s3Client, new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: item.screenVideoKey,
        }), { expiresIn: 3600 });
      }

      return {
        ...item,
        webcamVideoUrl: webcamUrl,
        screenVideoUrl: screenUrl
      };
    }));

    console.log("Recordings with URLs:", recordingsWithUrls);

    res.status(200).json(recordingsWithUrls);
  } catch (error) {
    console.error("Error in getRecordings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteRecording = async (req, res) => {
  try {
    const userId = req.userId;
    const recordingId = req.params.id;

    console.log(`Attempting to delete recording: ${recordingId} for user: ${userId}`);

    // First, try to fetch the recording
    const { Items } = await dynamoDB.send(new QueryCommand({
      TableName: process.env.DYNAMODB_RECORDINGS_TABLE,
      KeyConditionExpression: "userId = :userId AND id = :id",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":id": recordingId
      },
      Limit: 1
    }));

    if (!Items || Items.length === 0) {
      console.log(`Recording not found: ${recordingId}`);
      return res.status(404).json({ message: "Recording not found" });
    }

    const recording = Items[0];

    console.log(`Found recording:`, recording);

    // Delete from S3 if keys exist
    if (recording.webcamVideoKey) {
      console.log(`Deleting webcam video from S3: ${recording.webcamVideoKey}`);
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: recording.webcamVideoKey,
      }));
    }

    if (recording.screenVideoKey) {
      console.log(`Deleting screen video from S3: ${recording.screenVideoKey}`);
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: recording.screenVideoKey,
      }));
    }

    if (recording.uploadedKey) {
      console.log(`Deleting uploaded video from S3: ${recording.uploadedKey}`);
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: recording.uploadedKey,
      }));
    }

    // Delete from DynamoDB
    console.log(`Deleting recording from DynamoDB: ${recordingId}`);
    await dynamoDB.send(new DeleteCommand({
      TableName: process.env.DYNAMODB_RECORDINGS_TABLE,
      Key: {
        userId: userId,
        id: recordingId
      }
    }));

    console.log(`Successfully deleted recording: ${recordingId}`);
    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRecording:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const streamVideo = async (req, res) => {
  try {
    const { key } = req.params;
    console.log("Attempting to stream video with key:", key);

    if (!key) {
      return res.status(400).json({ message: "Video key is missing" });
    }

    const { ContentType, ContentLength, Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
      })
    );

    res.writeHead(200, {
      'Content-Type': ContentType,
      'Content-Length': ContentLength,
    });

    Body.pipe(res);
  } catch (error) {
    console.error("Error in streamVideo:", error);
    if (error.name === 'NoSuchKey') {
      console.error("The specified key does not exist in the S3 bucket:", req.params.key);
      res.status(404).json({ message: "Video not found" });
    } else {
      res.status(500).json({ message: "Error streaming video", error: error.message });
    }
  }
};

const checkVideoExists = async (req, res) => {
  try {
    const key = req.params.key;
    console.log("Checking if video exists with key:", key);

    const command = new HeadObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);

    res.status(200).json({ exists: true });
  } catch (error) {
    console.error("Error checking video existence:", error);
    if (error.name === 'NotFound') {
      res.status(404).json({ exists: false, message: "Video not found" });
    } else {
      res.status(500).json({ message: "Error checking video", error: error.message });
    }
  }
};

const downloadRecording = async (req, res) => {
  console.log("Download request received");
  console.log("Request params:", req.params);
  console.log("Request query:", req.query);
  console.log("Request headers:", req.headers);

  try {
    const { id } = req.params;
    console.log("Extracted id from params:", id);

    if (!id) {
      console.log("Video id is missing in the request params");
      return res.status(400).json({ message: "Video id is missing" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: id,
    });

    console.log("Sending GetObjectCommand to S3");
    const { ContentType, ContentLength, Body } = await s3Client.send(command);
    console.log("Received response from S3");

    res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
    res.setHeader('Content-Type', ContentType);
    res.setHeader('Content-Length', ContentLength);

    console.log("Starting to pipe the response");
    Body.pipe(res);
  } catch (error) {
    console.error("Error in downloadRecording:", error);
    if (error.name === 'NoSuchKey') {
      res.status(404).json({ message: "Video not found" });
    } else {
      res.status(500).json({ message: "Error downloading video", error: error.message });
    }
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