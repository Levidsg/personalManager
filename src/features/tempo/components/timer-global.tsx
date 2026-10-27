'use client';

import { useEffect, useState, useTransition } from 'react';
import { Play, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { iniciarTimer, pararTimer } from '../actions';

interface ProjetoSimples {
  id: string;
  titulo: string;
}

interface TimerAtivo {
  id: string;
  projetoId: string;
  projetoTitulo: string;
  inicio: Date;
}

export function TimerGlobal({
  timerAtivo,
  projetos,
}: {
  timerAtivo: TimerAtivo | null;
  projetos: ProjetoSimples[];
}) {
  const [isPending, startTransition] = useTransition();
  const [projetoSelecionado, setProjetoSelecionado] = useState(
    projetos[0]?.id ?? '',
  );

  const calcularSegundos = () => {
    if (!timerAtivo) return 0;
    return Math.max(0, Math.floor((Date.now() - new Date(timerAtivo.inicio).getTime()) / 1000));
  };

  const [segundosDecorridos, setSegundosDecorridos] = useState(calcularSegundos);

  // Efeito de ticker em tempo real
  useEffect(() => {
    if (!timerAtivo) return;

    const inicioTime = new Date(timerAtivo.inicio).getTime();

    const interval = setInterval(() => {
      setSegundosDecorridos(Math.max(0, Math.floor((Date.now() - inicioTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerAtivo]);

  const segundosExibidos = timerAtivo ? segundosDecorridos : 0;

  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleIniciar = () => {
    if (!projetoSelecionado) {
      toast.erro('Selecione um projeto para iniciar o timer.');
      return;
    }

    startTransition(async () => {
      try {
        await iniciarTimer({ projetoId: projetoSelecionado });
        toast.sucesso('Timer iniciado com sucesso!');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao iniciar timer';
        toast.erro(msg);
      }
    });
  };

  const handleParar = () => {
    startTransition(async () => {
      try {
        await pararTimer();
        toast.sucesso('Timer finalizado e tempo registrado no projeto.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao parar timer';
        toast.erro(msg);
      }
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Informações do Timer */}
      <div className="flex items-center gap-3.5">
        <div
          className={`size-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            timerAtivo
              ? 'bg-accent/15 text-accent animate-pulse'
              : 'bg-card-secondary text-secondary'
          }`}
        >
          <Timer className="size-5.5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-caption2 font-semibold uppercase tracking-wider text-tertiary">
              Timer de Produção (§8.5)
            </span>
            {timerAtivo && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                <span className="size-1.5 rounded-full bg-accent animate-ping" />
                Em execução
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5 mt-0.5">
            <span className="text-title3 font-bold text-label tabular-nums tracking-tight">
              {formatarTempo(segundosExibidos)}
            </span>
            {timerAtivo && (
              <span className="text-caption1 text-secondary truncate max-w-[200px]">
                {timerAtivo.projetoTitulo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controles de Ação */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {timerAtivo ? (
          <Button
            variante="destrutivo"
            onClick={handleParar}
            disabled={isPending}
            className="w-full sm:w-auto gap-1.5"
          >
            <Square className="size-4 fill-current" />
            <span>Parar Timer</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={projetoSelecionado}
              onChange={(e) => setProjetoSelecionado(e.target.value)}
              disabled={isPending || projetos.length === 0}
              className="flex-1 sm:w-56 h-10 px-3 rounded-xl bg-card-secondary border border-border text-label text-caption1 focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            >
              {projetos.length === 0 ? (
                <option value="">Nenhum projeto ativo</option>
              ) : (
                projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))
              )}
            </select>

            <Button
              variante="primario"
              onClick={handleIniciar}
              disabled={isPending || projetos.length === 0}
              className="gap-1.5 shrink-0"
            >
              <Play className="size-4 fill-current" />
              <span>Iniciar</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
