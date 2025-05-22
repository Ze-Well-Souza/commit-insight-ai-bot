
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
    githubToken: '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',
    openaiApiKey: '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',
    repositoryUrl: 'https://github.com/Ze-Well-Souza/repo-analyzer-bot',
    analysisInterval: 30,
  });

  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  // Carregar configuração do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('repo-analyzer-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...config, ...parsedConfig });
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }

    const savedAnalyses = localStorage.getItem('repo-analyzer-analyses');
    if (savedAnalyses) {
      try {
        setAnalyses(JSON.parse(savedAnalyses));
      } catch (error) {
        console.error('Error loading saved analyses:', error);
      }
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

  const isConfigured = config.githubToken && config.openaiApiKey && config.repositoryUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Repo Analyzer Bot
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema inteligente de análise contínua de repositórios usando GitHub API e OpenAI
          </p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span>GitHub Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span>AI Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Continuous Monitoring</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="runner" disabled={!isConfigured} className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Executar Análise
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resultados
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              GitHub Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <ConfigPanel config={config} onConfigUpdate={handleConfigUpdate} />
          </TabsContent>

          <TabsContent value="runner" className="space-y-6">
            <AnalysisRunner config={config} onAnalysisComplete={handleAnalysisComplete} />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <AnalysisResults analyses={analyses} />
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <WebhookInfo />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            🚀 Desenvolvido para análise inteligente de código • 
            <span className="font-medium"> GitHub API + OpenAI</span> • 
            Monitoramento contínuo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
