'use client';

/** Último recurso: erro no layout raiz. Renderiza o próprio documento, sem estilos globais. */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
          background: '#000',
          color: '#f5f5f7',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <title>Controle — erro</title>
        <div>
          <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Não foi possível abrir o app</h1>
          <p style={{ margin: '0 0 20px', color: '#a1a1a6' }}>
            Verifique sua conexão e tente de novo.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              font: 'inherit',
              padding: '10px 20px',
              borderRadius: 12,
              border: 0,
              background: '#0a84ff',
              color: '#fff',
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
