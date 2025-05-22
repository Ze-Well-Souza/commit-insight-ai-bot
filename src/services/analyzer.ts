
import { GitHubService } from './github';
import { OpenAIService } from './openai';
import { Analysis } from '../types';

export class RepositoryAnalyzer {
  private github: GitHubService;
  private openai: OpenAIService;

  constructor(githubToken: string, openaiApiKey: string) {
    this.github = new GitHubService(githubToken);
    this.openai = new OpenAIService(openaiApiKey);
  }

  async analyzeRepository(repositoryUrl: string): Promise<Analysis[]> {
    console.log('Starting repository analysis for:', repositoryUrl);
    
    const { owner, repo } = this.parseGitHubUrl(repositoryUrl);
    
    try {
      // Buscar últimos commits
      const commits = await this.github.getLatestCommits(owner, repo, 5);
      console.log(`Found ${commits.length} commits to analyze`);

      const analyses: Analysis[] = [];

      for (const commit of commits) {
        try {
          console.log(`Analyzing commit: ${commit.sha.substring(0, 7)} - ${commit.commit.message}`);
          
          // Buscar diff e arquivos do commit
          const [diff, files] = await Promise.all([
            this.github.getCommitDiff(owner, repo, commit.sha),
            this.github.getCommitFiles(owner, repo, commit.sha)
          ]);

          // Analisar com OpenAI
          const aiAnalysis = await this.openai.analyzeCommit(
            commit.commit.message,
            diff,
            files
          );

          const analysis: Analysis = {
            id: commit.sha,
            repositoryName: `${owner}/${repo}`,
            commitSha: commit.sha,
            commitMessage: commit.commit.message,
            analysis: aiAnalysis.analysis,
            timestamp: commit.commit.author.date,
            status: 'completed',
            score: aiAnalysis.score,
            suggestions: aiAnalysis.suggestions
          };

          analyses.push(analysis);
          console.log(`Analysis completed for commit ${commit.sha.substring(0, 7)} with score ${aiAnalysis.score}`);
          
        } catch (error) {
          console.error(`Error analyzing commit ${commit.sha}:`, error);
          analyses.push({
            id: commit.sha,
            repositoryName: `${owner}/${repo}`,
            commitSha: commit.sha,
            commitMessage: commit.commit.message,
            analysis: `Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            timestamp: commit.commit.author.date,
            status: 'error'
          });
        }
      }

      return analyses;
    } catch (error) {
      console.error('Repository analysis failed:', error);
      throw error;
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } {
    // Suporta URLs como:
    // https://github.com/owner/repo
    // https://github.com/owner/repo.git
    // owner/repo
    
    const cleanUrl = url.replace(/\.git$/, '');
    const match = cleanUrl.match(/(?:https?:\/\/github\.com\/)?([^\/]+)\/([^\/]+)/);
    
    if (!match) {
      throw new Error('URL do repositório inválida. Use o formato: owner/repo ou https://github.com/owner/repo');
    }

    return {
      owner: match[1],
      repo: match[2]
    };
  }
}
