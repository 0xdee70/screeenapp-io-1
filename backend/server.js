const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/AuthRoute');
const cors = require('cors');
const session = require('express-session');
const passport = require('./passportConfig');
const recordingRoutes = require('./routes/RecordingRoute');
const adminRoutes = require('./routes/AdminRoute');
const userProfileRoutes = require('./routes/user-profile');
dotenv.config();

const app = express();

app.use(cors({
  origin: '*', // or '*' for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
}));

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', recordingRoutes);

// Remove MongoDB connection

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});