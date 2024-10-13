const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure AWS DynamoDB
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const findOrCreateUser = async (profile, strategyName) => {
  console.log(`${strategyName} profile:`, JSON.stringify(profile, null, 2));

  let email;
  if (profile.emails && profile.emails.length > 0) {
    email = profile.emails[0].value;
  } else if (profile._json && profile._json.email) {
    email = profile._json.email;
  }

  if (!email) {
    console.error(`No email found in ${strategyName} profile`);
    throw new Error(`No email found in ${strategyName} profile`);
  }

  // Check if user exists in DynamoDB
  const scanParams = {
    TableName: process.env.DYNAMODB_USERS_TABLE,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  const { Items } = await dynamoDB.send(new ScanCommand(scanParams));

  if (Items && Items.length > 0) {
    return Items[0];
  } else {
    // Create new user in DynamoDB
    const newUser = {
      id: 'USER',
      userId: uuidv4(),
      name: profile.displayName || profile.username || email.split('@')[0],
      email: email,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const putParams = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Item: newUser
    };

    await dynamoDB.send(new PutCommand(putParams));
    return newUser;
  }
};

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/github/callback`,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'GitHub');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'Google');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Microsoft Strategy
passport.use(new MicrosoftStrategy({
  clientID: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/microsoft/callback`,
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'Microsoft');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.userId);
});

// Deserialize user from the session
passport.deserializeUser(async (userId, done) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE,
      Key: {
        id: 'USER',
        userId: userId
      }
    };

    const { Item } = await dynamoDB.send(new GetCommand(params));
    done(null, Item);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;