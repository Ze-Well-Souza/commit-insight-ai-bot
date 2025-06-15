
export interface ConfigData {
  githubToken: string;
  openaiApiKey: string;
  repositoryUrl: string;
  analysisInterval: number;
}

export interface Analysis {
  id: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  analysisContent: string;
  status: 'Completed' | 'In Progress' | 'Failed';
}
