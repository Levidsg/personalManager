'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { hoje, somarDias } from '@/lib/dates';
import { validarSomaParcelas } from '@/lib/finance';
import { formatarMoeda, type Centavos } from '@/lib/money';
import { criarProjeto } from '../actions';
import type { ParcelaInput } from '../schema';

interface ClienteSimples {
  id: string;
  nome: string;
}

interface ServicoSimples {
  id: string;
  nome: string;
  precoBaseCentavos: number;
  prazoMedioDias: number;
  revisoesIncluidas: number;
}

export function NovoProjetoSheet({
  clientes,
  servicos,
}: {
  clientes: ClienteSimples[];
  servicos: ServicoSimples[];
}) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const dataHoje = hoje();

  const [clienteId, setClienteId] = useState(clientes[0]?.id ?? '');
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorTotalCentavos, setValorTotalCentavos] = useState<Centavos>(
    servicos[0]?.precoBaseCentavos ?? 100000,
  );
  const [dataInicio, setDataInicio] = useState(dataHoje);
  const [prazoEntrega, setPrazoEntrega] = useState(
    somarDias(dataHoje, servicos[0]?.prazoMedioDias ?? 14),
  );
  const [revisoesIncluidas, setRevisoesIncluidas] = useState(
    servicos[0]?.revisoesIncluidas ?? 2,
  );
  const [horasEstimadas, setHorasEstimadas] = useState<number | ''>('');

  // Preset de parcelas
  const [presetParcelas, setPresetParcelas] = useState<'a_vista' | '50_50' | 'personalizado'>('a_vista');
  const [parcelas, setParcelas] = useState<ParcelaInput[]>([
    {
      descricao: 'Pagamento integral',
      valorCentavos: servicos[0]?.precoBaseCentavos ?? 100000,
      vencimento: somarDias(dataHoje, servicos[0]?.prazoMedioDias ?? 14),
    },
  ]);

  const aplicarPreset = (
    preset: 'a_vista' | '50_50' | 'personalizado',
    total = valorTotalCentavos,
    prazo = prazoEntrega,
    inicio = dataInicio,
  ) => {
    setPresetParcelas(preset);
    if (preset === 'a_vista') {
      setParcelas([
        {
          descricao: 'Pagamento integral',
          valorCentavos: total,
          vencimento: prazo,
        },
      ]);
    } else if (preset === '50_50') {
      const metade1 = Math.round(total / 2);
      const metade2 = total - metade1;
      setParcelas([
        {
          descricao: 'Entrada (50%)',
          valorCentavos: metade1,
          vencimento: inicio,
        },
        {
          descricao: 'Entrega final (50%)',
          valorCentavos: metade2,
          vencimento: prazo,
        },
      ]);
    }
  };

  const handleServicoChange = (novoServicoId: string) => {
    setServicoId(novoServicoId);
    const s = servicos.find((item) => item.id === novoServicoId);
    if (s) {
      if (s.precoBaseCentavos > 0) {
        setValorTotalCentavos(s.precoBaseCentavos);
      }
      const novoPrazo = somarDias(dataInicio, s.prazoMedioDias);
      setPrazoEntrega(novoPrazo);
      setRevisoesIncluidas(s.revisoesIncluidas);
      aplicarPreset(presetParcelas, s.precoBaseCentavos > 0 ? s.precoBaseCentavos : valorTotalCentavos, novoPrazo);
    }
  };

  const handleValorTotalChange = (novoValor: Centavos) => {
    setValorTotalCentavos(novoValor);
    if (presetParcelas !== 'personalizado') {
      aplicarPreset(presetParcelas, novoValor);
    }
  };

  const handleAdicionarParcela = () => {
    setPresetParcelas('personalizado');
    setParcelas([
      ...parcelas,
      {
        descricao: `Parcela ${parcelas.length + 1}`,
        valorCentavos: 0,
        vencimento: prazoEntrega,
      },
    ]);
  };

  const handleRemoverParcela = (index: number) => {
    if (parcelas.length <= 1) return;
    setPresetParcelas('personalizado');
    setParcelas(parcelas.filter((_, i) => i !== index));
  };

  const handleAtualizarParcela = (
    index: number,
    campo: keyof ParcelaInput,
    valor: string | number,
  ) => {
    setPresetParcelas('personalizado');
    const novas = [...parcelas];
    novas[index] = { ...novas[index], [campo]: valor } as ParcelaInput;
    setParcelas(novas);
  };

  const validacaoParcelas = validarSomaParcelas(
    valorTotalCentavos,
    parcelas.map((p) => p.valorCentavos),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      toast.erro('Selecione ou cadastre um cliente primeiro.');
      return;
    }
    if (!servicoId) {
      toast.erro('Selecione ou cadastre um serviço primeiro.');
      return;
    }
    if (!titulo.trim()) {
      toast.erro('Informe o título do projeto.');
      return;
    }
    if (valorTotalCentavos <= 0) {
      toast.erro('O valor total do projeto deve ser maior que zero.');
      return;
    }
    if (!validacaoParcelas.valida) {
      toast.erro(
        `A soma das parcelas (${formatarMoeda(
          validacaoParcelas.somaParcelasCentavos,
        )}) difere do total do projeto (${formatarMoeda(valorTotalCentavos)}).`,
      );
      return;
    }

    try {
      setSalvando(true);
      await criarProjeto({
        clienteId,
        servicoId,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        valorTotalCentavos,
        dataInicio,
        prazoEntrega,
        revisoesIncluidas,
        horasEstimadas: typeof horasEstimadas === 'number' ? horasEstimadas : null,
        parcelas,
      });

      toast.sucesso('Projeto criado com sucesso!');
      setAberto(false);
      setTitulo('');
      setDescricao('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar projeto.';
      toast.erro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button variante="primario" className="gap-1.5">
          <Plus className="size-4" />
          <span>Novo Projeto</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        titulo="Novo Projeto Freela"
        descricao="Cadastre o escopo, prazos e cronograma de recebimentos"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2 pb-6">
          {/* Cliente */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Cliente
            </label>
            {clientes.length === 0 ? (
              <p className="text-caption2 text-red-500">
                Nenhum cliente ativo. Cadastre um cliente antes de criar projetos.
              </p>
            ) : (
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Serviço Base */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Serviço do Catálogo
            </label>
            {servicos.length === 0 ? (
              <p className="text-caption2 text-red-500">
                Nenhum serviço ativo. Cadastre um serviço no catálogo.
              </p>
            ) : (
              <select
                value={servicoId}
                onChange={(e) => handleServicoChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              >
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Título do Projeto */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Título do Projeto
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Edição Vídeo YouTube #42"
              className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Valor Total */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Valor Total do Projeto
            </label>
            <CurrencyInput
              value={valorTotalCentavos}
              onChange={handleValorTotalChange}
              id="novo-projeto-valor"
            />
          </div>

          {/* Datas: Início e Prazo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Data de Início
              </label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  if (presetParcelas === '50_50') {
                    aplicarPreset('50_50', valorTotalCentavos, prazoEntrega, e.target.value);
                  }
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Prazo de Entrega
              </label>
              <input
                type="date"
                required
                value={prazoEntrega}
                onChange={(e) => {
                  setPrazoEntrega(e.target.value);
                  if (presetParcelas !== 'personalizado') {
                    aplicarPreset(presetParcelas, valorTotalCentavos, e.target.value);
                  }
                }}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Revisões e Horas Estimadas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Revisões Incluídas
              </label>
              <input
                type="number"
                min={0}
                value={revisoesIncluidas}
                onChange={(e) => setRevisoesIncluidas(Number(e.target.value))}
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Horas Estimadas (opcional)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Ex: 8"
                value={horasEstimadas}
                onChange={(e) =>
                  setHorasEstimadas(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Descrição / Escopo */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Escopo / Observações (opcional)
            </label>
            <textarea
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Inclui cortes dinâmicos, correção de cor e 2 variações de thumbnail."
              className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-label text-body focus:outline-hidden focus:ring-2 focus:ring-accent/30 resize-none"
            />
          </div>

          {/* Seção de Parcelas (§8.1) */}
          <div className="pt-2 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-caption1 font-bold text-label">Cronograma de Pagamento</h4>
                <p className="text-caption2 text-tertiary">
                  Total das parcelas:{' '}
                  <span
                    className={
                      validacaoParcelas.valida ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'
                    }
                  >
                    {formatarMoeda(validacaoParcelas.somaParcelasCentavos)}
                  </span>
                </p>
              </div>

              {/* Botões de Preset */}
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-card-secondary text-caption2">
                <button
                  type="button"
                  onClick={() => aplicarPreset('a_vista')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    presetParcelas === 'a_vista' ? 'bg-card text-label font-semibold shadow-xs' : 'text-tertiary'
                  }`}
                >
                  À vista
                </button>
                <button
                  type="button"
                  onClick={() => aplicarPreset('50_50')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    presetParcelas === '50_50' ? 'bg-card text-label font-semibold shadow-xs' : 'text-tertiary'
                  }`}
                >
                  50/50
                </button>
              </div>
            </div>

            {/* Lista Dinâmica de Parcelas */}
            <div className="space-y-2">
              {parcelas.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-card-secondary border border-border/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={p.descricao}
                      onChange={(e) => handleAtualizarParcela(idx, 'descricao', e.target.value)}
                      placeholder="Descrição da parcela"
                      className="flex-1 h-9 px-2.5 rounded-lg bg-card border border-border text-caption1 text-label"
                    />
                    {parcelas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoverParcela(idx)}
                        className="p-1.5 rounded-lg text-tertiary hover:text-red-500 transition-colors"
                        title="Remover parcela"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <CurrencyInput
                      value={p.valorCentavos}
                      onChange={(novoValor) =>
                        handleAtualizarParcela(idx, 'valorCentavos', novoValor)
                      }
                      id={`parcela-${idx}-valor`}
                    />
                    <input
                      type="date"
                      value={p.vencimento}
                      onChange={(e) => handleAtualizarParcela(idx, 'vencimento', e.target.value)}
                      className="h-10 px-2.5 rounded-xl bg-card border border-border text-caption1 text-label"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variante="secundario"
                onClick={handleAdicionarParcela}
                className="w-full text-caption1 gap-1"
              >
                <Plus className="size-3.5" />
                <span>Adicionar Parcela</span>
              </Button>
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variante="simples"
              onClick={() => setAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variante="primario"
              disabled={salvando || !validacaoParcelas.valida}
            >
              {salvando ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
