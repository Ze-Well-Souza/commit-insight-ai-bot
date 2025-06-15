
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebhookInfo = () => {
  const { toast } = useToast();
  const webhookUrl = `${window.location.origin}/webhook`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: 'URL Copiada!',
      description: 'A URL do webhook foi copiada para a área de transferência.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do GitHub Actions</CardTitle>
        <CardDescription>
          Para que o bot analise os commits automaticamente, configure um webhook no seu repositório do GitHub.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">Siga os passos abaixo no repositório que você deseja monitorar:</p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Vá em <b>Settings</b> &gt; <b>Secrets and variables</b> &gt; <b>Actions</b>. <span title="Acesse as configurações do repositório para cadastrar a URL do webhook." className="text-xs ml-1 cursor-help text-blue-500">(?)</span></li>
          <li>Clique em <b>New repository secret</b>.</li>
          <li>Use o nome <Code className="text-xs">ANALYZER_WEBHOOK_URL</Code>.
            <span className="ml-2 text-xs border px-1 rounded bg-muted" title="Esse secret contém a URL do seu backend onde o GitHub irá chamar a cada push.">(Saiba mais)</span>
          </li>
          <li>No valor do secret, cole a seguinte URL:</li>
        </ol>
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-grow bg-transparent text-sm focus:outline-none"
          />
          <Button onClick={copyToClipboard} variant="ghost" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Finalmente, crie o arquivo <Code className="text-xs">.github/workflows/repo-analyzer.yml</Code> com o conteúdo do{' '}
          <a href="/webhook-example.yml" target="_blank" rel="noopener noreferrer" className="underline text-primary">
            arquivo de exemplo
          </a>.
        </p>
      </CardContent>
    </Card>
  );
};

export default WebhookInfo;

