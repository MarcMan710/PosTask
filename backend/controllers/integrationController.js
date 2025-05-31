const slackService = require('../services/slackService');
const googleCalendarService = require('../services/googleCalendarService');
const githubService = require('../services/githubService');

class IntegrationController {
  // Slack endpoints
  async sendSlackMessage(req, res) {
    try {
      const { channel, message } = req.body;
      const result = await slackService.sendMessage(channel, message);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listSlackChannels(req, res) {
    try {
      const channels = await slackService.listChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Google Calendar endpoints
  async getGoogleAuthUrl(req, res) {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleGoogleCallback(req, res) {
    try {
      const { code } = req.query;
      const tokens = await googleCalendarService.getToken(code);
      googleCalendarService.setCredentials(tokens);
      res.json({ message: 'Successfully authenticated with Google Calendar' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createCalendarEvent(req, res) {
    try {
      const event = await googleCalendarService.createEvent(req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GitHub endpoints
  async getGithubAuthUrl(req, res) {
    try {
      const authUrl = await githubService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createGithubIssue(req, res) {
    try {
      const { owner, repo, title, body } = req.body;
      const issue = await githubService.createIssue(owner, repo, title, body);
      res.json(issue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listGithubRepositories(req, res) {
    try {
      const repos = await githubService.listRepositories();
      res.json(repos);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new IntegrationController(); 