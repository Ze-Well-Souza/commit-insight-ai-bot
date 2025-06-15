
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Analysis } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
                  <div className="flex-1 text-left">
                    <p className="font-semibold truncate">{analysis.commitMessage}</p>
                    <p className="text-sm text-muted-foreground">
                      por {analysis.author} • {formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={analysis.status === 'Completed' ? 'default' : 'destructive'} className="ml-4">
                    {analysis.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap font-sans">{analysis.analysisContent}</pre>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
