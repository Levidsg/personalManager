'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { type Centavos } from '@/lib/money';
import { criarServico } from '../actions';

const CORES_SUGERIDAS = [
  '#007AFF', // Azul
  '#10B981', // Verde
  '#F59E0B', // Âmbar
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#64748B', // Cinza
];

export function NovoServicoSheet() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('palette');
  const [cor, setCor] = useState(CORES_SUGERIDAS[0]!);
  const [precoBaseCentavos, setPrecoBaseCentavos] = useState<Centavos>(150000);
  const [unidadePreco, setUnidadePreco] = useState<'projeto' | 'hora'>('projeto');
  const [prazoMedioDias, setPrazoMedioDias] = useState(7);
  const [revisoesIncluidas, setRevisoesIncluidas] = useState(2);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome do serviço.');
      return;
    }

    try {
      setSalvando(true);
      await criarServico({
        nome: nome.trim(),
        icone,
        cor,
        precoBaseCentavos,
        unidadePreco,
        prazoMedioDias,
        revisoesIncluidas,
        ativo: true,
      });
      toast.sucesso('Serviço cadastrado com sucesso!');
      setAberto(false);
      setNome('');
      setPrecoBaseCentavos(150000);
    } catch {
      toast.erro('Não foi possível cadastrar o serviço.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Novo Serviço
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Novo Serviço"
        descricao="Defina serviços padrão para gerar propostas e projetos com rapidez"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Nome do Serviço
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Identidade Visual, Landing Page, Consultoria"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Ícone
              </label>
              <select
                value={icone}
                onChange={(e) => setIcone(e.target.value)}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="palette">Design / Arte</option>
                <option value="code">Desenvolvimento / Código</option>
                <option value="film">Vídeo / Animação</option>
                <option value="camera">Fotografia</option>
                <option value="terminal">DevOps / Infra</option>
                <option value="sparkles">Consultoria / Estratégia</option>
              </select>
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Cor de Destaque
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {CORES_SUGERIDAS.map((c) => {
                  const selecionada = c === cor;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCor(c)}
                      className={`size-6 rounded-full transition-transform cursor-pointer ${
                        selecionada
                          ? 'ring-2 ring-accent ring-offset-2 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Cor ${c}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Formato de Cobrança
            </label>
            <SegmentedControl
              itens={[
                { valor: 'projeto', rotulo: 'Por Projeto' },
                { valor: 'hora', rotulo: 'Por Hora' },
              ]}
              valor={unidadePreco}
              onChange={(v) => setUnidadePreco(v as 'projeto' | 'hora')}
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Preço Base Sugerido
            </label>
            <CurrencyInput
              value={precoBaseCentavos}
              onChange={setPrecoBaseCentavos}
              className="w-full text-2xl font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Prazo Médio (Dias)
              </label>
              <input
                type="number"
                min={1}
                value={prazoMedioDias}
                onChange={(e) => setPrazoMedioDias(Number(e.target.value))}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Revisões Incluídas
              </label>
              <input
                type="number"
                min={0}
                value={revisoesIncluidas}
                onChange={(e) => setRevisoesIncluidas(Number(e.target.value))}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <Button type="submit" disabled={salvando} className="w-full mt-3">
            {salvando ? 'Salvando...' : 'Cadastrar Serviço'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
