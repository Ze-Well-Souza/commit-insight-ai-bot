
import { Repository, Commit } from '../types';

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  
  constructor(private token: string) {}

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getLatestCommits(owner: string, repo: string, limit = 10): Promise<Commit[]> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getCommitDiff(owner: string, repo: string, sha: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3.diff',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.text();
  }

  async getCommitFiles(owner: string, repo: string, sha: string) {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    return data.files || [];
  }
}
