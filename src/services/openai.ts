
export class OpenAIService {
  private baseUrl = 'https://api.openai.com/v1';
  
  constructor(private apiKey: string) {}

  async analyzeCommit(
    commitMessage: string,
    diff: string,
    files: any[]
  ): Promise<{
    analysis: string;
    score: number;
    suggestions: string[];
  }> {
    const prompt = this.buildAnalysisPrompt(commitMessage, diff, files);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em análise de código e revisão de commits. Analise o commit fornecido e forneça insights valiosos sobre qualidade, padrões e melhorias.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return this.parseAnalysisResponse(content);
  }

  private buildAnalysisPrompt(commitMessage: string, diff: string, files: any[]): string {
    const filesList = files.map(f => `- ${f.filename} (${f.status})`).join('\n');
    
    return `
Analise este commit do GitHub:

**Mensagem do Commit:**
${commitMessage}

**Arquivos Modificados:**
${filesList}

**Diff das Mudanças:**
\`\`\`diff
${diff.length > 3000 ? diff.substring(0, 3000) + '...' : diff}
\`\`\`

Por favor, forneça uma análise estruturada seguindo este formato:

**ANÁLISE:** [Resumo da análise geral do commit]

**PONTUAÇÃO:** [Número de 1-10 representando a qualidade do commit]

**SUGESTÕES:**
- [Sugestão 1]
- [Sugestão 2]
- [Sugestão 3]

Considere aspectos como:
- Qualidade e clareza da mensagem do commit
- Padrões de código
- Segurança
- Performance
- Manutenibilidade
- Testes
    `;
  }

  private parseAnalysisResponse(content: string): {
    analysis: string;
    score: number;
    suggestions: string[];
  } {
    const lines = content.split('\n');
    let analysis = '';
    let score = 7;
    let suggestions: string[] = [];
    
    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('**ANÁLISE:**')) {
        currentSection = 'analysis';
        analysis = trimmed.replace('**ANÁLISE:**', '').trim();
      } else if (trimmed.startsWith('**PONTUAÇÃO:**')) {
        currentSection = 'score';
        const scoreMatch = trimmed.match(/(\d+)/);
        if (scoreMatch) {
          score = parseInt(scoreMatch[1]);
        }
      } else if (trimmed.startsWith('**SUGESTÕES:**')) {
        currentSection = 'suggestions';
      } else if (currentSection === 'analysis' && trimmed) {
        analysis += ' ' + trimmed;
      } else if (currentSection === 'suggestions' && trimmed.startsWith('-')) {
        suggestions.push(trimmed.replace(/^-\s*/, ''));
      }
    }

    return {
      analysis: analysis || content,
      score: Math.max(1, Math.min(10, score)),
      suggestions
    };
  }
}
