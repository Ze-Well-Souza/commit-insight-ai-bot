
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { ConfigData, Analysis } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface AnalysisRunnerProps {
  config: ConfigData;
  onAnalysisComplete: (newAnalyses: Analysis[]) => void;
}

const AnalysisRunner: React.FC<AnalysisRunnerProps> = ({ config, onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newAnalysis: Analysis = {
      id: new Date().toISOString(),
      commitSha: 'a1b2c3d',
      commitMessage: 'feat: Implementa nova funcionalidade de teste',
      author: 'Usuário de Teste',
      timestamp: new Date().toISOString(),
      analysisContent: 'Esta é uma análise de simulação. O código parece bom, mas poderia ter mais testes.',
      status: 'Completed',
    };

    onAnalysisComplete((prev) => [newAnalysis, ...prev]);
    setIsLoading(false);
    toast({
      title: "Análise Concluída!",
      description: "A análise de simulação foi adicionada aos resultados.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executar Análise Manualmente</CardTitle>
        <CardDescription>
          Clique no botão abaixo para simular uma análise do seu repositório.
        </CardDescription>
      </Header>
      <CardContent>
        <Button onClick={handleRunAnalysis} disabled={isLoading || !config.repositoryUrl}>
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? 'Analisando...' : 'Iniciar Análise'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalysisRunner;
