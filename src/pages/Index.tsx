
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigPanel from '../components/ConfigPanel';
import AnalysisRunner from '../components/AnalysisRunner';
import AnalysisResults from '../components/AnalysisResults';
import WebhookInfo from '../components/WebhookInfo';
import { ConfigData, Analysis } from '../types';
import { GitBranch, Bot, BarChart3, Webhook } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// O ideal é que esta URL venha de uma variável de ambiente (.env)
// Mas para este exemplo, vamos defini-la aqui.
const API_URL = 'http://localhost:3000';

const fetchAnalyses = async (): Promise<Analysis[]> => {
  try {
    const { data } = await axios.get(`${API_URL}/api/analyses`);
    if (data.success) {
      return data.data;
    }
    throw new Error(data.message || 'Falha ao buscar análises');
  } catch (error) {
    console.error('Erro na busca de análises:', error);
    // Retorna array vazio em caso de erro para não quebrar a UI
    return [];
  }
};

const Index = () => {
  const [config, setConfig] = useState<ConfigData>({
    githubToken: '',
    openaiApiKey: '',
    repositoryUrl: '',
    analysisInterval: 30,
  });

  const { data: analyses, isLoading, refetch } = useQuery<Analysis[]>({
    queryKey: ['analyses'],
    queryFn: fetchAnalyses,
  });

  // Carregar apenas a configuração do localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('repo-analyzer-config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Erro ao carregar configuração do localStorage:', error);
    }
  }, []);

  const handleConfigUpdate = (newConfig: ConfigData) => {
    setConfig(newConfig);
    localStorage.setItem('repo-analyzer-config', JSON.stringify(newConfig));
  };

  const isConfigured = !!config.repositoryUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full text-primary-foreground">
              <Bot className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Repo Analyzer Bot
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma para análise contínua e inteligente de repositórios GitHub usando IA.
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="config">
              <GitBranch className="mr-2" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="runner" disabled={!isConfigured}>
              <Bot className="mr-2" />
              Executar Análise
            </TabsTrigger>
            <TabsTrigger value="results">
              <BarChart3 className="mr-2" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Webhook className="mr-2" />
              GitHub Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <ConfigPanel config={config} onConfigUpdate={handleConfigUpdate} />
          </TabsContent>

          <TabsContent value="runner">
            <AnalysisRunner config={config} onAnalysisStarted={refetch} />
          </TabsContent>

          <TabsContent value="results">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <AnalysisResults analyses={analyses || []} />
            )}
          </TabsContent>

          <TabsContent value="webhook">
            <WebhookInfo />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            🚀 Desenvolvido para análise inteligente de código.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
