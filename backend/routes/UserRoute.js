const express = require('express');
const { RegisterUser, LoginUser, handleSSOSuccess } = require('../controller/UserController');
const passport = require('passport');

const router = express.Router();

router.post('/register', RegisterUser);
router.post('/login', LoginUser);

// SSO routes
router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), handleSSOSuccess);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), handleSSOSuccess);

router.get('/auth/microsoft', passport.authenticate('microsoft'));
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/login' }), handleSSOSuccess);

module.exports = router;