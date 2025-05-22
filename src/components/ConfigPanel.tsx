
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfigData } from '../types';
import { AlertCircle, Settings, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfigPanelProps {
  config: ConfigData;
  onConfigUpdate: (config: ConfigData) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigUpdate }) => {
  const [localConfig, setLocalConfig] = useState<ConfigData>(config);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onConfigUpdate(localConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isConfigValid = localConfig.githubToken && localConfig.openaiApiKey && localConfig.repositoryUrl;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuração do Bot Analisador
        </CardTitle>
        <CardDescription>
          Configure as credenciais e parâmetros para análise automática do repositório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="github-token">GitHub Token</Label>
          <Input
            id="github-token"
            type="password"
            placeholder="ghp_..."
            value={localConfig.githubToken}
            onChange={(e) => setLocalConfig({ ...localConfig, githubToken: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Token do GitHub com permissões de leitura de repositórios
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <Input
            id="openai-key"
            type="password"
            placeholder="sk-proj-..."
            value={localConfig.openaiApiKey}
            onChange={(e) => setLocalConfig({ ...localConfig, openaiApiKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Chave da API OpenAI para análise de código com IA
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repo-url">URL do Repositório</Label>
          <Input
            id="repo-url"
            placeholder="https://github.com/Ze-Well-Souza/repo-analyzer-bot"
            value={localConfig.repositoryUrl}
            onChange={(e) => setLocalConfig({ ...localConfig, repositoryUrl: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            URL completa do repositório ou formato owner/repo
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interval">Intervalo de Análise (minutos)</Label>
          <Input
            id="interval"
            type="number"
            min="5"
            max="1440"
            value={localConfig.analysisInterval}
            onChange={(e) => setLocalConfig({ ...localConfig, analysisInterval: parseInt(e.target.value) || 30 })}
          />
          <p className="text-xs text-muted-foreground">
            Frequência de verificação por novos commits (mínimo 5 minutos)
          </p>
        </div>

        {!isConfigValid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por favor, preencha todos os campos obrigatórios para continuar.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={!isConfigValid}
        >
          <Save className="h-4 w-4 mr-2" />
          {saved ? 'Configuração Salva!' : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
