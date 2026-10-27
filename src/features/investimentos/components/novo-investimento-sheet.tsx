'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { type Centavos } from '@/lib/money';
import { criarInvestimento } from '../actions';

interface TipoInvestimentoOpcao {
  id: string;
  nome: string;
  icone: string;
}

const CORES_SUGERIDAS = [
  '#007AFF', // Azul
  '#10B981', // Verde
  '#F59E0B', // Âmbar
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#64748B', // Ardósia
];

export function NovoInvestimentoSheet({ tipos }: { tipos: TipoInvestimentoOpcao[] }) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [tipoId, setTipoId] = useState(tipos[0]?.id ?? '');
  const [saldoInicialCentavos, setSaldoInicialCentavos] = useState<Centavos>(0);
  const [cor, setCor] = useState(CORES_SUGERIDAS[0]!);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome do ativo.');
      return;
    }
    if (!tipoId) {
      toast.erro('Selecione o tipo de investimento.');
      return;
    }

    try {
      setSalvando(true);
      await criarInvestimento({
        nome: nome.trim(),
        tipoId,
        saldoInicialCentavos,
        cor,
      });
      toast.sucesso('Investimento cadastrado com sucesso!');
      setAberto(false);
      setNome('');
      setSaldoInicialCentavos(0);
    } catch {
      toast.erro('Não foi possível cadastrar o investimento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Novo Ativo
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Novo Investimento"
        descricao="Cadastre uma ação, FII, renda fixa ou reserva"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Nome do Ativo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Tesouro Selic 2029, IVVB11, CDB Nubank"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Tipo de Investimento
            </label>
            <select
              value={tipoId}
              onChange={(e) => setTipoId(e.target.value)}
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Saldo Inicial
            </label>
            <CurrencyInput
              value={saldoInicialCentavos}
              onChange={setSaldoInicialCentavos}
              className="w-full text-2xl font-bold"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-2">
              Cor de Destaque
            </label>
            <div className="flex items-center gap-2.5">
              {CORES_SUGERIDAS.map((c) => {
                const ativa = c === cor;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(c)}
                    className={`size-7 rounded-full transition-transform cursor-pointer ${
                      ativa ? 'ring-2 ring-accent ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Cor ${c}`}
                  />
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={salvando} className="w-full mt-4">
            {salvando ? 'Salvando...' : 'Cadastrar Ativo'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
