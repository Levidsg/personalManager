'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { type Centavos } from '@/lib/money';
import { criarContribuicao } from '../actions';

export function NovaContribuicaoSheet() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('heart');
  const [modelo, setModelo] = useState<'percentual' | 'fixo'>('percentual');
  const [percentual, setPercentual] = useState<string>('10');
  const [valorFixoCentavos, setValorFixoCentavos] = useState<Centavos>(0);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome da contribuição.');
      return;
    }

    let percentualPb: number | null = null;
    if (modelo === 'percentual') {
      const percNum = parseFloat(percentual.replace(',', '.'));
      if (isNaN(percNum) || percNum <= 0 || percNum > 100) {
        toast.erro('Informe uma alíquota válida entre 0,1% e 100%.');
        return;
      }
      percentualPb = Math.round(percNum * 100);
    }

    try {
      setSalvando(true);
      await criarContribuicao({
        nome: nome.trim(),
        icone,
        modelo,
        percentualPb,
        valorFixoCentavos: modelo === 'fixo' ? valorFixoCentavos : null,
        recorrente: true,
      });
      toast.sucesso('Contribuição configurada com sucesso!');
      setAberto(false);
      setNome('');
      setPercentual('10');
      setValorFixoCentavos(0);
    } catch {
      toast.erro('Não foi possível salvar a contribuição.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Nova Contribuição
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Nova Contribuição / Dízimo"
        descricao="Configure uma alíquota ou valor fixo para cálculo mensal automático"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4 py-2">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Nome da Contribuição
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Dízimo, Oferta de Gratidão, Ajuda aos Pais"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Ícone de Identificação
            </label>
            <select
              value={icone}
              onChange={(e) => setIcone(e.target.value)}
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
            >
              <option value="heart">Coração (Apoio / Amor)</option>
              <option value="sparkles">Dízimo (Fidelidade / Gratidão)</option>
              <option value="wallet">Oferta / Repasse</option>
              <option value="users">Família / Comunidade</option>
            </select>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Modelo de Rateio
            </label>
            <SegmentedControl
              itens={[
                { valor: 'percentual', rotulo: 'Percentual (%)' },
                { valor: 'fixo', rotulo: 'Valor Fixo (R$)' },
              ]}
              valor={modelo}
              onChange={(v) => setModelo(v as 'percentual' | 'fixo')}
            />
          </div>

          {modelo === 'percentual' ? (
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Alíquota (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max="100"
                  value={percentual}
                  onChange={(e) => setPercentual(e.target.value)}
                  placeholder="Ex: 10"
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <span className="absolute right-3 top-2.5 text-secondary text-footnote font-medium">
                  % sobre a base
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Valor Fixo Mensal
              </label>
              <CurrencyInput
                value={valorFixoCentavos}
                onChange={setValorFixoCentavos}
                className="w-full text-2xl font-bold"
              />
            </div>
          )}

          <Button type="submit" disabled={salvando} className="w-full mt-3">
            {salvando ? 'Salvando...' : 'Cadastrar Contribuição'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
