
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfigPanel from '../components/ConfigPanel';
import AnalysisRunner from '../components/AnalysisRunner';
import AnalysisResults from '../components/AnalysisResults';
import WebhookInfo from '../components/WebhookInfo';
import { ConfigData, Analysis } from '../types';
import { GitBranch, Bot, BarChart3, Webhook } from 'lucide-react';

const Index = () => {
  const [config, setConfig] = useState<ConfigData>({
    githubToken: '',
    openaiApiKey: '',
    repositoryUrl: '',
    analysisInterval: 30,
  });

  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('repo-analyzer-config');
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }

      const savedAnalyses = localStorage.getItem('repo-analyzer-analyses');
      if (savedAnalyses) {
        setAnalyses(JSON.parse(savedAnalyses));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  }, []);

  const handleConfigUpdate = (newConfig: ConfigData) => {
    setConfig(newConfig);
    localStorage.setItem('repo-analyzer-config', JSON.stringify(newConfig));
  };

  const handleAnalysisComplete = (newAnalyses: Analysis[]) => {
    setAnalyses(newAnalyses);
    localStorage.setItem('repo-analyzer-analyses', JSON.stringify(newAnalyses));
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
            <AnalysisRunner config={config} onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="results">
            <AnalysisResults analyses={analyses} />
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
