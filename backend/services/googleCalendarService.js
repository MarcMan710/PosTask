const { google } = require('googleapis');
const config = require('../config/integrations');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes
    });
  }

  async getToken(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async createEvent(event) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create Google Calendar event: ${error.message}`);
    }
  }

  async listEvents(timeMin, timeMax) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      });
      return response.data.items;
    } catch (error) {
      throw new Error(`Failed to list Google Calendar events: ${error.message}`);
    }
  }
}

module.exports = new GoogleCalendarService(); 