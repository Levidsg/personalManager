'use client';

import { createElement, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Switch } from '@/components/ui/switch';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { toast } from '@/components/ui/toast';
import { type Centavos } from '@/lib/money';
import { iconePorChave } from '@/lib/icons';
import { CATALOGO_SERVICOS, type ServicoPredefinido } from '../catalogo';
import { criarAssinatura } from '../actions';

export function NovaAssinaturaSheet() {
  const [aberto, setAberto] = useState(false);

  const [servico, setServico] = useState('custom');
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('credit-card');
  const [cor, setCor] = useState('#007AFF');
  const [valorCentavos, setValorCentavos] = useState<Centavos>(0);
  const [periodicidade, setPeriodicidade] = useState<'mensal' | 'anual'>('mensal');
  const [diaVencimento, setDiaVencimento] = useState(5);
  const [mesVencimento, setMesVencimento] = useState(1);
  const [trabalho, setTrabalho] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSelectServico = (item: ServicoPredefinido) => {
    setServico(item.chave);
    setNome(item.nome);
    setIcone(item.icone);
    setCor(item.cor);
    setValorCentavos(item.valorSugeridoCentavos);
    setPeriodicidade(item.periodicidadeSugerida);
    setTrabalho(item.trabalhoSugerido);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome da assinatura.');
      return;
    }
    if (valorCentavos <= 0) {
      toast.erro('Informe um valor maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      await criarAssinatura({
        servico,
        nome: nome.trim(),
        icone,
        cor,
        valorCentavos,
        periodicidade,
        diaVencimento,
        mesVencimento: periodicidade === 'anual' ? mesVencimento : null,
        ativa: true,
        trabalho,
      });
      toast.sucesso('Assinatura cadastrada com sucesso!');
      setAberto(false);
      setNome('');
      setValorCentavos(0);
      setServico('custom');
    } catch {
      toast.erro('Não foi possível cadastrar a assinatura.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Nova Assinatura
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Nova Assinatura"
        descricao="Escolha do catálogo ou personalize um serviço recorrente"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Catálogo Rápido (§7.4) */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Escolher do Catálogo
            </label>
            <div className="grid grid-cols-5 gap-2 pb-1">
              {CATALOGO_SERVICOS.slice(0, 10).map((cat) => {
                const selecionado = servico === cat.chave;
                return (
                  <button
                    key={cat.chave}
                    type="button"
                    onClick={() => handleSelectServico(cat)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selecionado
                        ? 'border-accent bg-accent/10 shadow-xs'
                        : 'border-border bg-card hover:bg-card-secondary'
                    }`}
                  >
                    <div
                      className="size-7 rounded-lg flex items-center justify-center mb-1"
                      style={{ backgroundColor: `${cat.cor}18`, color: cat.cor }}
                    >
                      {createElement(iconePorChave(cat.icone), {
                        className: 'size-3.5',
                        strokeWidth: 2,
                      })}
                    </div>
                    <span className="text-[10px] font-medium text-label truncate max-w-full">
                      {cat.nome.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Nome da Assinatura
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Spotify Família, ChatGPT Plus"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Valor da Recorrência
            </label>
            <CurrencyInput
              value={valorCentavos}
              onChange={setValorCentavos}
              className="w-full text-2xl font-bold"
            />
          </div>

          {/* Periodicidade */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Frequência
            </label>
            <SegmentedControl
              itens={[
                { valor: 'mensal', rotulo: 'Mensal' },
                { valor: 'anual', rotulo: 'Anual' },
              ]}
              valor={periodicidade}
              onChange={(v) => setPeriodicidade(v as 'mensal' | 'anual')}
            />
          </div>

          {/* Vencimento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Dia de Vencimento
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(Number(e.target.value))}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {periodicidade === 'anual' && (
              <div>
                <label className="text-caption1 font-medium text-secondary block mb-1.5">
                  Mês de Vencimento
                </label>
                <select
                  value={mesVencimento}
                  onChange={(e) => setMesVencimento(Number(e.target.value))}
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value={1}>Janeiro</option>
                  <option value={2}>Fevereiro</option>
                  <option value={3}>Março</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Maio</option>
                  <option value={6}>Junho</option>
                  <option value={7}>Julho</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Setembro</option>
                  <option value={10}>Outubro</option>
                  <option value={11}>Novembro</option>
                  <option value={12}>Dezembro</option>
                </select>
              </div>
            )}
          </div>

          {/* Tag Trabalho */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-card-secondary border border-border">
            <div className="space-y-0.5">
              <span className="text-subhead font-medium text-label block">
                Custo de Trabalho (Freela)
              </span>
              <span className="text-caption2 text-secondary block">
                Dedutível no cálculo de lucro da Contribuição Familiar
              </span>
            </div>
            <Switch checked={trabalho} onCheckedChange={setTrabalho} />
          </div>

          <Button type="submit" disabled={salvando} className="w-full mt-3">
            {salvando ? 'Salvando...' : 'Cadastrar Assinatura'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
