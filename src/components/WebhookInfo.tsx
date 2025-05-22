
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Webhook, 
  Copy, 
  ExternalLink, 
  Github, 
  Code,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const WebhookInfo: React.FC = () => {
  const webhookUrl = `${window.location.origin}/api/webhook`;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência.",
    });
  };

  const githubActionCode = `name: Repository Analyzer Bot

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master ]

jobs:
  analyze:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      with:
        fetch-depth: 2

    - name: Get commit info
      id: commit
      run: |
        echo "sha=$(git rev-parse HEAD)" >> $GITHUB_OUTPUT
        echo "message=$(git log -1 --pretty=%B)" >> $GITHUB_OUTPUT
        echo "author=$(git log -1 --pretty=%an)" >> $GITHUB_OUTPUT

    - name: Send webhook to analyzer
      run: |
        curl -X POST "${webhookUrl}" \\
          -H "Content-Type: application/json" \\
          -d '{
            "repository": "$\{{ github.repository }}",
            "commit_sha": "$\{{ steps.commit.outputs.sha }}",
            "commit_message": "$\{{ steps.commit.outputs.message }}",
            "author": "$\{{ steps.commit.outputs.author }}",
            "branch": "$\{{ github.ref_name }}"
          }'`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Integração com GitHub Actions
        </CardTitle>
        <CardDescription>
          Configure webhooks para análise automática em cada commit
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              URL do Webhook
            </h4>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                {webhookUrl}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Github className="h-4 w-4" />
              Configuração do GitHub Actions
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Crie o arquivo <code>.github/workflows/repo-analyzer.yml</code> no seu repositório:
            </p>
            
            <div className="relative">
              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-96">
                <code>{githubActionCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(githubActionCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Como Funciona
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">1</Badge>
                <div>
                  <strong>Trigger:</strong> A action é executada automaticamente em push/PR
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">2</Badge>
                <div>
                  <strong>Coleta:</strong> Informações do commit são extraídas
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">3</Badge>
                <div>
                  <strong>Webhook:</strong> Dados são enviados para este analisador
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="shrink-0">4</Badge>
                <div>
                  <strong>Análise:</strong> IA processa e gera insights sobre o código
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">💡 Dica para Deploy</h5>
            <p className="text-sm text-blue-800">
              Para usar em produção, faça deploy desta aplicação em plataformas como Railway, 
              Render ou Vercel e use a URL pública no webhook.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookInfo;
