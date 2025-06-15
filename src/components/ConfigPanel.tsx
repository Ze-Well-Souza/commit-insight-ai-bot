
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfigData } from '../types';
import { useToast } from '@/hooks/use-toast';

interface ConfigPanelProps {
  config: ConfigData;
  onConfigUpdate: (newConfig: ConfigData) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigUpdate }) => {
  const [localConfig, setLocalConfig] = React.useState(config);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onConfigUpdate(localConfig);
    toast({
      title: "Configuração Salva!",
      description: "Suas configurações foram salvas no navegador.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Análise</CardTitle>
        <CardDescription>
          Insira suas chaves de API e a URL do repositório para começar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repositoryUrl">URL do Repositório GitHub</Label>
          <Input id="repositoryUrl" name="repositoryUrl" value={localConfig.repositoryUrl} onChange={handleChange} placeholder="https://github.com/usuario/repo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubToken">Token do GitHub (Opcional)</Label>
          <Input id="githubToken" name="githubToken" type="password" value={localConfig.githubToken} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="openaiApiKey">Chave da API OpenAI (Opcional)</Label>
          <Input id="openaiApiKey" name="openaiApiKey" type="password" value={localConfig.openaiApiKey} onChange={handleChange} />
        </div>
        <Button onClick={handleSave}>Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
