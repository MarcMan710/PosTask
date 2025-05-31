const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const auth = require('../middlewares/auth');

// Slack routes
router.post('/slack/message', auth, integrationController.sendSlackMessage);
router.get('/slack/channels', auth, integrationController.listSlackChannels);

// Google Calendar routes
router.get('/google/auth', auth, integrationController.getGoogleAuthUrl);
router.get('/google/callback', integrationController.handleGoogleCallback);
router.post('/google/events', auth, integrationController.createCalendarEvent);

// GitHub routes
router.get('/github/auth', auth, integrationController.getGithubAuthUrl);
router.post('/github/issues', auth, integrationController.createGithubIssue);
router.get('/github/repos', auth, integrationController.listGithubRepositories);

module.exports = router; 