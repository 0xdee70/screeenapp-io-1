const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('./models/User');

const configureStrategy = (Strategy, name, profileToUser) => {
  passport.use(new Strategy({
    clientID: process.env[`${name.toUpperCase()}_CLIENT_ID`],
    clientSecret: process.env[`${name.toUpperCase()}_CLIENT_SECRET`],
    callbackURL: `${process.env.API_URL}/auth/${name.toLowerCase()}/callback`,
    scope: ['user:email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const userData = profileToUser(profile);
      
      if (!userData.email) {
        return done(new Error(`No email found in ${name} profile`), null);
      }

      let user = await User.findOne({ email: userData.email });

      if (!user) {
        const role = userData.email.endsWith('@duck.com') ? 'admin' : 'user';
        user = new User({
          ...userData,
          role,
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
};

configureStrategy(GitHubStrategy, 'Github', (profile) => ({
  githubId: profile.id,
  email: profile.emails[0].value,
  username: profile.username,
}));

configureStrategy(GoogleStrategy, 'Google', (profile) => ({
  googleId: profile.id,
  email: profile.emails[0].value,
  username: profile.displayName,
}));

configureStrategy(MicrosoftStrategy, 'Microsoft', (profile) => ({
  microsoftId: profile.id,
  email: profile.emails[0].value,
  username: profile.displayName,
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;