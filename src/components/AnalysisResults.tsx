
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Analysis } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  GitCommit, 
  Calendar,
  Lightbulb
} from 'lucide-react';

interface AnalysisResultsProps {
  analyses: Analysis[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses }) => {
  const getStatusIcon = (status: Analysis['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-500';
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma análise disponível ainda.</p>
            <p className="text-sm">Execute uma análise para ver os resultados aqui.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resultados das Análises</h3>
        <Badge variant="outline">
          {analyses.length} análise{analyses.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {analyses.map((analysis) => (
        <Card key={analysis.id} className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(analysis.status)}
                  <span className="font-mono text-sm">
                    {analysis.commitSha.substring(0, 7)}
                  </span>
                  {analysis.score && (
                    <Badge className={getScoreColor(analysis.score)}>
                      <Star className="h-3 w-3 mr-1" />
                      {analysis.score}/10
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(analysis.timestamp)}
                  </span>
                  <span className="font-medium">{analysis.repositoryName}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Mensagem do Commit:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded font-mono">
                {analysis.commitMessage}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-sm mb-2">Análise da IA:</h4>
              <p className="text-sm leading-relaxed">
                {analysis.analysis}
              </p>
            </div>

            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Sugestões de Melhoria:
                  </h4>
                  <ul className="space-y-1">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalysisResults;
