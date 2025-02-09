const GITHUB_API = 'https://api.github.com';

export interface GithubConfig {
  owner: string;
  repo: string;
  path: string;
  token?: string;
}

export class GithubService {
  private config: GithubConfig;

  constructor(config: GithubConfig) {
    this.config = config;
  }

  async saveHeartRateData(data: { heartRate: number; timestamp: number }[]): Promise<void> {
    if (!this.config.token) {
      throw new Error('GitHub token is required for saving data');
    }

    const content = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `heartrate-${timestamp}.json`;

    try {
      // Check if file exists
      let sha: string | undefined;
      try {
        const existing = await this.getFile(filename);
        sha = existing.sha;
      } catch (error) {
        // File doesn't exist yet, which is fine
      }

      // Create or update file
      await fetch(`${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update heart rate data for ${timestamp}`,
          content: Buffer.from(content).toString('base64'),
          sha: sha,
        }),
      });
    } catch (error) {
      console.error('Error saving to GitHub:', error);
      throw new Error('Failed to save data to GitHub');
    }
  }

  private async getFile(filename: string): Promise<any> {
    const response = await fetch(
      `${GITHUB_API}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}/${filename}`,
      {
        headers: this.config.token ? {
          'Authorization': `token ${this.config.token}`,
        } : {},
      }
    );

    if (!response.ok) {
      throw new Error('File not found');
    }

    return response.json();
  }
}

export const createGithubService = (config: GithubConfig): GithubService => {
  return new GithubService(config);
};