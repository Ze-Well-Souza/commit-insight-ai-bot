import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfigData } from '../types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  config: ConfigData;
  onConfigUpdate: (newConfig: ConfigData) => void;
}

const validateUrl = (url: string): string | null => {
  if (!url) return null; // Não mostra erro se o campo estiver vazio
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== 'github.com') {
      return "A URL deve ser de um repositório do GitHub.";
    }
    // Verifica se o path tem pelo menos dois segmentos (usuário/repo)
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathSegments.length < 2) {
      return "Formato inválido. Ex: https://github.com/usuario/repo";
    }
  } catch (error) {
    return "URL inválida.";
  }
  return null;
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigUpdate }) => {
  const [localConfig, setLocalConfig] = React.useState(config);
  const [urlError, setUrlError] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    // Sincroniza o estado local se a config externa mudar
    setLocalConfig(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'repositoryUrl') {
      setUrlError(validateUrl(value));
    }
    setLocalConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const error = validateUrl(localConfig.repositoryUrl);
    setUrlError(error);

    if (error || !localConfig.repositoryUrl) {
       toast({
        variant: "destructive",
        title: "URL Inválida!",
        description: error || "O campo de URL do repositório é obrigatório.",
      });
      return;
    }

    onConfigUpdate(localConfig);
    toast({
      title: "Configuração Salva!",
      description: "Suas configurações foram salvas no navegador.",
    });
  };

  const isSaveDisabled = !!urlError || !localConfig.repositoryUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da Análise</CardTitle>
        <CardDescription>
          Insira suas chaves de API e a URL do repositório para começar. <span className="block text-xs mt-2 text-blue-600">Dica: Salve o token do GitHub para análises privadas ou repositórios privados (opcional).</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="repositoryUrl">URL do Repositório GitHub
            <span className="ml-1 text-xs text-muted-foreground" title="Formato recomendado: https://github.com/usuario/repo">(?)</span>
          </Label>
          <Input 
            id="repositoryUrl" 
            name="repositoryUrl" 
            value={localConfig.repositoryUrl} 
            onChange={handleChange} 
            placeholder="https://github.com/usuario/repo" 
            className={cn(urlError && "border-destructive focus-visible:ring-destructive")}
          />
          {urlError && <p className="text-xs text-destructive">{urlError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubToken">Token do GitHub <span className="text-xs text-muted-foreground">(Opcional, apenas para repositórios privados)</span></Label>
          <Input id="githubToken" name="githubToken" type="password" value={localConfig.githubToken} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="openaiApiKey">Chave da API OpenAI <span className="text-xs text-muted-foreground">(Opcional)</span></Label>
          <Input id="openaiApiKey" name="openaiApiKey" type="password" value={localConfig.openaiApiKey} onChange={handleChange} />
        </div>
        <Button onClick={handleSave} disabled={isSaveDisabled}>Salvar Configurações</Button>
      </CardContent>
    </Card>
  );
};

export default ConfigPanel;
