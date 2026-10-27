'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { hoje } from '@/lib/dates';
import { registrarTempoManual } from '../actions';

interface ProjetoOpcao {
  id: string;
  titulo: string;
}

export function NovoTempoManualSheet({
  projetos,
}: {
  projetos: ProjetoOpcao[];
}) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [projetoId, setProjetoId] = useState(projetos[0]?.id ?? '');
  const [data, setData] = useState(hoje());
  const [horas, setHoras] = useState(1);
  const [minutos, setMinutos] = useState(0);
  const [nota, setNota] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoId) {
      toast.erro('Selecione um projeto.');
      return;
    }
    const minutosTotais = Number(horas) * 60 + Number(minutos);
    if (minutosTotais <= 0) {
      toast.erro('Informe uma duração válida.');
      return;
    }

    try {
      setSalvando(true);
      await registrarTempoManual({
        projetoId,
        data,
        minutos: minutosTotais,
        nota: nota.trim() || null,
      });

      toast.sucesso('Tempo registrado com sucesso no projeto!');
      setAberto(false);
      setNota('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar tempo';
      toast.erro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variante="secundario" className="gap-1.5">
          <Clock className="size-4" />
          <span>Lançar Horas</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        titulo="Lançamento Manual de Horas"
        descricao="Insira sessões de trabalho realizadas fora do timer"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2 pb-6">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Projeto
            </label>
            {projetos.length === 0 ? (
              <p className="text-caption2 text-red-500">Nenhum projeto ativo.</p>
            ) : (
              <select
                value={projetoId}
                onChange={(e) => setProjetoId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              >
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titulo}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Data do Trabalho
            </label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Horas
              </label>
              <input
                type="number"
                min={0}
                required
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Minutos
              </label>
              <input
                type="number"
                min={0}
                max={59}
                required
                value={minutos}
                onChange={(e) => setMinutos(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Descrição da Atividade (opcional)
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ex: Correção de áudio e masterização"
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variante="simples"
              onClick={() => setAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button type="submit" variante="primario" disabled={salvando || !projetoId}>
              {salvando ? 'Salvando...' : 'Registrar Horas'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
