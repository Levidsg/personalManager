'use client';

import { createElement, type ReactNode, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  CHAVES_CORES,
  CHAVES_ICONES,
  type ChaveCor,
  type ChaveIcone,
  CORES,
  ICONES,
  iconePorChave,
} from '@/lib/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export interface IconPickerProps {
  icone: ChaveIcone;
  cor: ChaveCor;
  onChangeIcone: (icone: ChaveIcone) => void;
  onChangeCor?: (cor: ChaveCor) => void;
  chavesPermitidas?: ChaveIcone[];
  children?: ReactNode;
}

function RenderIcone({
  chave,
  className,
  strokeWidth = 1.75,
}: {
  chave: string | null | undefined;
  className?: string;
  strokeWidth?: number;
}) {
  return createElement(iconePorChave(chave), { className, strokeWidth });
}

/**
 * Seletor de ícones próprio (§6.6, §6.8).
 * Grade curada de ícones + seletor de cores da paleta de séries.
 */
export function IconPicker({
  icone,
  cor,
  onChangeIcone,
  onChangeCor,
  chavesPermitidas = CHAVES_ICONES,
  children,
}: IconPickerProps) {
  const [aberto, setAberto] = useState(false);
  const corAtual = CORES[cor]?.variavel ?? CORES.cinza.variavel;

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        {children ? (
          children
        ) : (
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-field border border-separator bg-surface p-2 transition-transform active:scale-95"
            style={{ color: corAtual }}
            aria-label="Alterar ícone e cor"
          >
            <RenderIcone chave={icone} className="size-6" strokeWidth={1.75} />
          </button>
        )}
      </SheetTrigger>
      <SheetContent titulo="Escolher ícone e cor" descricao="Selecione um ícone e uma cor de identificação">
        {/* Seletor de cor */}
        {onChangeCor && (
          <div className="mb-5">
            <span className="mb-2 block text-subhead font-medium text-label-2">Cor</span>
            <div className="flex items-center gap-3">
              {CHAVES_CORES.map((chave) => {
                const info = CORES[chave];
                const selecionada = chave === cor;
                return (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => onChangeCor(chave)}
                    aria-label={`Cor ${info.rotulo}`}
                    aria-pressed={selecionada}
                    className={cn(
                      'size-9 rounded-full transition-transform active:scale-95',
                      selecionada ? 'ring-2 ring-accent ring-offset-2 scale-110' : 'opacity-85 hover:opacity-100',
                    )}
                    style={{ backgroundColor: info.variavel }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Grade de ícones */}
        <div>
          <span className="mb-2 block text-subhead font-medium text-label-2">Ícone</span>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
            {chavesPermitidas.map((chave) => {
              const info = ICONES[chave];
              if (!info) return null;
              const selecionado = chave === icone;
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => {
                    onChangeIcone(chave);
                    setAberto(false);
                  }}
                  title={info.rotulo}
                  aria-label={info.rotulo}
                  aria-pressed={selecionado}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-control p-2 transition-colors',
                    selecionado
                      ? 'bg-fill-2 text-accent ring-1 ring-accent'
                      : 'bg-fill text-label-2 hover:text-label hover:bg-fill-2',
                  )}
                  style={selecionado ? { color: corAtual } : undefined}
                >
                  <RenderIcone chave={chave} className="size-5" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
