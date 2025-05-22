
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  clone_url: string;
  updated_at: string;
  default_branch: string;
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface Analysis {
  id: string;
  repositoryName: string;
  commitSha: string;
  commitMessage: string;
  analysis: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'error';
  score?: number;
  suggestions?: string[];
}

export interface ConfigData {
  githubToken: string;
  openaiApiKey: string;
  repositoryUrl: string;
  analysisInterval: number;
}
