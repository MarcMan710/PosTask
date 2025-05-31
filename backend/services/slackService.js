const { WebClient } = require('@slack/web-api');
const config = require('../config/integrations');

class SlackService {
  constructor() {
    this.client = new WebClient(config.slack.botToken);
  }

  async sendMessage(channel, message) {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text: message
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to send Slack message: ${error.message}`);
    }
  }

  async createChannel(name) {
    try {
      const result = await this.client.conversations.create({
        name
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to create Slack channel: ${error.message}`);
    }
  }

  async listChannels() {
    try {
      const result = await this.client.conversations.list();
      return result.channels;
    } catch (error) {
      throw new Error(`Failed to list Slack channels: ${error.message}`);
    }
  }
}

module.exports = new SlackService(); 