
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RepositoryAnalyzer } from '../services/analyzer';
import { ConfigData, Analysis } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AnalysisRunnerProps {
  config: ConfigData;
  onAnalysisComplete: (analyses: Analysis[]) => void;
}

const AnalysisRunner: React.FC<AnalysisRunnerProps> = ({ config, onAnalysisComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const runAnalysis = async () => {
    if (!config.githubToken || !config.openaiApiKey || !config.repositoryUrl) {
      toast({
        title: "Configuração Incompleta",
        description: "Por favor, configure todas as credenciais necessárias.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentStep('Inicializando análise...');

    try {
      const analyzer = new RepositoryAnalyzer(config.githubToken, config.openaiApiKey);
      
      setProgress(20);
      setCurrentStep('Conectando ao GitHub...');
      
      const analyses = await analyzer.analyzeRepository(config.repositoryUrl);
      
      setProgress(100);
      setCurrentStep('Análise concluída!');
      setLastRun(new Date());
      
      onAnalysisComplete(analyses);
      
      toast({
        title: "Análise Concluída",
        description: `${analyses.length} commit(s) analisado(s) com sucesso.`,
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentStep('Erro na análise');
      
      toast({
        title: "Erro na Análise",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 3000);
    }
  };

  const toggleAutoMode = () => {
    if (autoMode) {
      // Parar modo automático
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setAutoMode(false);
      toast({
        title: "Modo Automático Desativado",
        description: "A análise automática foi interrompida.",
      });
    } else {
      // Iniciar modo automático
      const interval = setInterval(() => {
        if (!isRunning) {
          runAnalysis();
        }
      }, config.analysisInterval * 60 * 1000);
      
      setIntervalId(interval);
      setAutoMode(true);
      
      toast({
        title: "Modo Automático Ativado",
        description: `Análises serão executadas a cada ${config.analysisInterval} minutos.`,
      });
    }
  };

  const getNextRunTime = () => {
    if (!lastRun || !autoMode) return null;
    const nextRun = new Date(lastRun.getTime() + config.analysisInterval * 60 * 1000);
    return nextRun;
  };

  const nextRun = getNextRunTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Execução de Análises
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={runAnalysis} 
            disabled={isRunning}
            className="flex-1"
          >
            {isRunning ? (
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Analisando...' : 'Executar Análise'}
          </Button>

          <Button 
            onClick={toggleAutoMode}
            variant={autoMode ? "destructive" : "outline"}
          >
            {autoMode ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Clock className="h-4 w-4 mr-2" />
            )}
            {autoMode ? 'Parar Auto' : 'Modo Auto'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={autoMode ? "default" : "secondary"}>
              {autoMode ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {autoMode ? 'Automático' : 'Manual'}
            </Badge>
          </div>

          {lastRun && (
            <div className="text-muted-foreground">
              <strong>Última execução:</strong><br />
              {lastRun.toLocaleString('pt-BR')}
            </div>
          )}

          {nextRun && autoMode && (
            <div className="text-muted-foreground">
              <strong>Próxima execução:</strong><br />
              {nextRun.toLocaleString('pt-BR')}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <strong>Dica:</strong> O modo automático executará análises a cada {config.analysisInterval} minutos.
          Certifique-se de que suas credenciais estão corretas antes de ativar.
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisRunner;
