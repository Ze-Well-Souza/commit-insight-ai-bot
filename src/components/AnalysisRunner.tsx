import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { ConfigData } from '../types';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from '../config';

interface AnalysisRunnerProps {
  config: ConfigData;
  onAnalysisStarted: () => void;
}

const AnalysisRunner: React.FC<AnalysisRunnerProps> = ({ config, onAnalysisStarted }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [runError, setRunError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    if (!config.repositoryUrl) {
      toast({
        variant: "destructive",
        title: "Repositório não configurado",
        description: "Por favor, configure a URL do repositório na aba 'Configuração'.",
      });
      return;
    }

    setIsLoading(true);
    setRunError(null);

    toast({
      title: "Iniciando análise...",
      description: "Sua requisição foi enviada para o backend.",
    });

    try {
      await axios.post(`${API_URL}/api/analyze`, {
        repositoryUrl: config.repositoryUrl,
        commitMessage: `Análise manual de ${config.repositoryUrl}`,
        author: "Painel Repo Analyzer",
      });

      toast({
        title: "Análise em progresso!",
        description: "O resultado aparecerá em breve na aba 'Resultados'.",
      });

      setTimeout(() => {
        toast({ title: "Atualizando lista de resultados..." });
        onAnalysisStarted();
      }, 15000); // 15 segundos para dar tempo para a IA.

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : (error as Error).message;

      setRunError(errorMessage || "Ocorreu um erro ao disparar a análise.");
      toast({
        variant: "destructive",
        title: "Erro ao iniciar análise",
        description: errorMessage || "Ocorreu um erro desconhecido.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executar Análise Manualmente</CardTitle>
        <CardDescription>
          Clique no botão abaixo para simular uma análise do seu repositório.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleRunAnalysis} disabled={isLoading || !config.repositoryUrl}>
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? 'Analisando...' : 'Iniciar Análise'}
        </Button>
        {runError && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive rounded p-2">
            {runError}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisRunner;
