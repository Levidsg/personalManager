'use client';

import { useTransition } from 'react';
import { HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { alternarModuloContribuicao } from '../actions';
import { FolhaEducativaSheet } from './folha-educativa-sheet';

export function ModuloInativoCard() {
  const [salvando, startTransition] = useTransition();

  const handleAtivar = () => {
    startTransition(async () => {
      try {
        await alternarModuloContribuicao(true);
        toast.sucesso('Módulo de Contribuição Familiar ativado!');
      } catch {
        toast.erro('Não foi possível ativar o módulo.');
      }
    });
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 text-center max-w-lg mx-auto space-y-4 my-8 shadow-xs">
      <div className="size-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
        <HeartHandshake className="size-6" strokeWidth={2} />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-title3 font-bold text-label">
          Módulo de Contribuição Familiar & Dízimo
        </h3>
        <p className="text-footnote text-secondary leading-relaxed">
          Este módulo é opcional e calcula automaticamente valores proporcionais de dízimo,
          ofertas ou rateios familiares com base no seu lucro líquido ou faturamento do mês.
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button onClick={handleAtivar} disabled={salvando} className="w-full sm:w-auto">
          {salvando ? 'Ativando...' : 'Ativar Módulo Agora'}
        </Button>
        <FolhaEducativaSheet />
      </div>
    </div>
  );
}
