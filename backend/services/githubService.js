const { Octokit } = require('octokit');
const config = require('../config/integrations');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_ACCESS_TOKEN
    });
  }

  async createIssue(owner, repo, title, body) {
    try {
      const response = await this.octokit.rest.issues.create({
        owner,
        repo,
        title,
        body
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create GitHub issue: ${error.message}`);
    }
  }

  async listRepositories() {
    try {
      const response = await this.octokit.rest.repos.listForAuthenticatedUser();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list GitHub repositories: ${error.message}`);
    }
  }

  async createRepository(name, description, isPrivate = false) {
    try {
      const response = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create GitHub repository: ${error.message}`);
    }
  }

  async getAuthUrl() {
    const scopes = ['repo', 'user'];
    return `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=${scopes.join(',')}`;
  }
}

module.exports = new GitHubService(); 