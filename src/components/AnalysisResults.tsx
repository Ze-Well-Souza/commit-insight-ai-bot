
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Analysis } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, GitCommit } from 'lucide-react';

interface AnalysisResultsProps {
  analyses: Analysis[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses }) => {
  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultados da Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma análise foi executada ainda. Execute uma análise na aba "Executar Análise" ou configure o webhook para análises automáticas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultados da Análise</CardTitle>
        <CardDescription>
          Aqui estão os resultados das análises de commit mais recentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {analyses.map((analysis) => (
            <AccordionItem value={analysis.id} key={analysis.id}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate" title={analysis.commitMessage}>{analysis.commitMessage}</p>
                      {analysis.commitUrl && (
                        <a 
                          href={analysis.commitUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          title="Ver commit no GitHub" 
                          className="text-primary hover:underline shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       {analysis.repository && <Badge variant="outline" className="font-normal">{analysis.repository.split('/').pop()}</Badge>}
                       <span>por {analysis.author}</span>
                       <span>•</span>
                       <span>{formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true, locale: ptBR })}</span>
                       <div className="flex items-center gap-1" title={analysis.commitSha}>
                        <GitCommit className="h-3 w-3" />
                        <span>{analysis.commitSha.substring(0, 7)}</span>
                       </div>
                    </div>
                  </div>
                  <Badge variant={analysis.status === 'Completed' ? 'default' : 'destructive'} className="ml-4">
                    {analysis.status === 'Failed' ? 'Falhou' : 'Concluído'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans bg-muted/50 p-4 rounded-md">{analysis.analysisContent}</pre>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
