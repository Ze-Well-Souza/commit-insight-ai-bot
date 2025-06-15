
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiErrorCardProps {
  error: Error;
  refetch: () => void;
}

const ApiErrorCard: React.FC<ApiErrorCardProps> = ({ error, refetch }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Falha ao Conectar com o Servidor</AlertTitle>
          <AlertDescription>
            <p className="mb-2">Não foi possível buscar os dados da API. Verifique sua conexão ou a configuração do servidor.</p>
            <p className="mt-2 text-xs font-mono bg-destructive/20 p-2 rounded">
              Detalhe: {error.message}
            </p>
            <Button onClick={() => refetch()} variant="secondary" size="sm" className="mt-4">
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ApiErrorCard;
