const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/AuthRouteMongo');
const cors = require('cors');
const session = require('express-session');
const passport = require('./passportConfig');
const recordingRoutes = require('./routes/RecordingRoute');


const userProfileRoutes = require('./routes/user-profileMongo');

dotenv.config();

const app = express();

// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   exposedHeaders: ['Content-Disposition'],
// }));

app.use(cors());

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api', recordingRoutes);



// for local testing mongodb 
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});



app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});