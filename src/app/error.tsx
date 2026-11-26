'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/error-state';

/**
 * Fronteira de erro das telas: quando o banco falha ou demora demais,
 * mostra uma mensagem clara com "Tentar de novo" em vez de ficar no skeleton.
 */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && 'digest' in error && typeof error.digest === 'string'
      ? error.digest
      : undefined;

  return (
    <ErrorState
      className="mt-6"
      mensagem={`Verifique sua conexão e tente de novo. Se continuar, o banco de dados pode estar indisponível no momento.${digest ? ` (código ${digest})` : ''}`}
      onTentarNovamente={retry}
    />
  );
}
