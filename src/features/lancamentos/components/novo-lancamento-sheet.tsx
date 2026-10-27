'use client';

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/toast';
import { hoje, mesAtual } from '@/lib/dates';
import { type Centavos, formatarMoeda } from '@/lib/money';
import { criarLancamento, consultarSaldoMesAnteriorAction } from '../actions';

interface CategoriaOpcao {
  id: string;
  nome: string;
  trabalhoPadrao: boolean;
}

interface InvestimentoOpcao {
  id: string;
  nome: string;
  saldoCentavos: Centavos;
}

export interface NovoLancamentoSheetProps {
  categorias: CategoriaOpcao[];
  investimentos: InvestimentoOpcao[];
  competencia?: string;
}

export function NovoLancamentoSheet({
  categorias,
  investimentos,
  competencia = mesAtual(),
}: NovoLancamentoSheetProps) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valorCentavos, setValorCentavos] = useState<Centavos>(0);
  const [data, setData] = useState(hoje());
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id ?? '');
  const [metodoPagamento, setMetodoPagamento] = useState<
    'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto'
  >('pix');
  const [trabalho, setTrabalho] = useState(false);
  const [tipoEntrada, setTipoEntrada] = useState<
    'salario' | 'extras' | 'fundo_anterior' | 'outras'
  >('extras');

  // Tirar de investimento (A9)
  const [tirarDeInvestimento, setTirarDeInvestimento] = useState(false);
  const [investimentoId, setInvestimentoId] = useState(investimentos[0]?.id ?? '');

  const [salvando, setSalvando] = useState(false);
  const [buscandoSaldoAnterior, setBuscandoSaldoAnterior] = useState(false);

  // Ao mudar de categoria, pré-preenche a marca de trabalho padrão
  const handleCategoriaChange = (id: string) => {
    setCategoriaId(id);
    const cat = categorias.find((c) => c.id === id);
    if (cat) {
      setTrabalho(cat.trabalhoPadrao);
    }
  };

  const handleTrazerSaldoAnterior = async () => {
    try {
      setBuscandoSaldoAnterior(true);
      const saldoAnterior = await consultarSaldoMesAnteriorAction(competencia);
      if (saldoAnterior <= 0) {
        toast.erro('Nenhum saldo positivo apurado no mês anterior.');
        return;
      }
      setTipoEntrada('fundo_anterior');
      setDescricao('Saldo trazido do mês anterior');
      setValorCentavos(saldoAnterior);
      toast.sucesso(`Valor preenchido: ${formatarMoeda(saldoAnterior)}`);
    } catch {
      toast.erro('Não foi possível obter o saldo do mês anterior.');
    } finally {
      setBuscandoSaldoAnterior(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) {
      toast.erro('Informe a descrição do lançamento.');
      return;
    }
    if (valorCentavos <= 0) {
      toast.erro('O valor deve ser maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      if (tipo === 'despesa') {
        await criarLancamento({
          tipo: 'despesa',
          descricao,
          valorCentavos,
          data,
          categoriaId,
          metodoPagamento,
          investimentoId: tirarDeInvestimento ? investimentoId : null,
          trabalho,
        });
      } else {
        await criarLancamento({
          tipo: 'receita',
          descricao,
          valorCentavos,
          data,
          tipoEntrada,
          trabalho,
        });
      }

      toast.sucesso('Lançamento registrado com sucesso.');
      setDescricao('');
      setValorCentavos(0);
      setTirarDeInvestimento(false);
      setAberto(false);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : 'Erro ao registrar lançamento.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button icone={<Plus className="size-4" strokeWidth={2} />}>
          Novo lançamento
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Novo Lançamento"
        descricao="Registre uma despesa ou receita em sua conta."
        rodape={
          <Button
            larguraTotal
            disabled={salvando || valorCentavos <= 0 || !descricao.trim()}
            onClick={handleSubmit}
          >
            {salvando ? 'Registrando...' : 'Registrar lançamento'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <SegmentedControl
            itens={[
              { valor: 'despesa', rotulo: 'Despesa' },
              { valor: 'receita', rotulo: 'Receita' },
            ]}
            valor={tipo}
            onChange={setTipo}
            rotuloAcessivel="Tipo de lançamento"
          />

          <div>
            <label htmlFor="lanc-desc" className="block text-subhead font-medium text-label-2 mb-1.5">
              Descrição
            </label>
            <input
              id="lanc-desc"
              type="text"
              placeholder={tipo === 'despesa' ? 'Ex: Compras da semana' : 'Ex: Projeto freela vídeo'}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="h-11 w-full rounded-field bg-fill px-3.5 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <CurrencyInput
            id="lanc-valor"
            rotulo="Valor"
            value={valorCentavos}
            onChange={setValorCentavos}
          />

          <div>
            <label htmlFor="lanc-data" className="block text-subhead font-medium text-label-2 mb-1.5">
              Data do lançamento
            </label>
            <input
              id="lanc-data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-11 w-full rounded-field bg-fill px-3.5 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {tipo === 'despesa' ? (
            <>
              <div>
                <label htmlFor="lanc-cat" className="block text-subhead font-medium text-label-2 mb-1.5">
                  Categoria
                </label>
                <select
                  id="lanc-cat"
                  value={categoriaId}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                  className="h-11 w-full rounded-field bg-fill px-3 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} {c.trabalhoPadrao ? '(Trabalho)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="lanc-metodo" className="block text-subhead font-medium text-label-2 mb-1.5">
                  Método de pagamento
                </label>
                <select
                  id="lanc-metodo"
                  value={metodoPagamento}
                  onChange={(e) =>
                    setMetodoPagamento(
                      e.target.value as 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'boleto',
                    )
                  }
                  className="h-11 w-full rounded-field bg-fill px-3 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="pix">PIX</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>

              {investimentos.length > 0 && (
                <div className="rounded-group border border-separator p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-subhead font-medium text-label">
                        Tirar de investimento (A9)
                      </span>
                      <span className="text-footnote text-label-2">
                        Abate do ativo e não entra no saldo mensal
                      </span>
                    </div>
                    <Switch
                      checked={tirarDeInvestimento}
                      onCheckedChange={setTirarDeInvestimento}
                      rotulo="Tirar de investimento"
                    />
                  </div>

                  {tirarDeInvestimento && (
                    <div>
                      <label htmlFor="lanc-inv" className="block text-footnote font-medium text-label-2 mb-1">
                        Selecione o investimento
                      </label>
                      <select
                        id="lanc-inv"
                        value={investimentoId}
                        onChange={(e) => setInvestimentoId(e.target.value)}
                        className="h-10 w-full rounded-control bg-fill px-3 text-subhead text-label font-medium outline-none"
                      >
                        {investimentos.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.nome} — Saldo: {formatarMoeda(inv.saldoCentavos)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label htmlFor="lanc-tipo-entrada" className="block text-subhead font-medium text-label-2 mb-1.5">
                  Tipo de entrada
                </label>
                <select
                  id="lanc-tipo-entrada"
                  value={tipoEntrada}
                  onChange={(e) =>
                    setTipoEntrada(
                      e.target.value as 'salario' | 'extras' | 'fundo_anterior' | 'outras',
                    )
                  }
                  className="h-11 w-full rounded-field bg-fill px-3 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="extras">Extras / Freela</option>
                  <option value="salario">Salário</option>
                  <option value="fundo_anterior">Fundo anterior</option>
                  <option value="outras">Outras entradas</option>
                </select>
              </div>

              <div className="pt-1">
                <Button
                  variante="secundario"
                  larguraTotal
                  disabled={buscandoSaldoAnterior}
                  onClick={handleTrazerSaldoAnterior}
                  icone={<Sparkles className="size-4 text-accent" strokeWidth={1.75} />}
                >
                  {buscandoSaldoAnterior
                    ? 'Calculando saldo anterior...'
                    : 'Trazer saldo do mês anterior (A8)'}
                </Button>
              </div>
            </>
          )}

          <div className="flex items-center justify-between border-t border-separator pt-3">
            <div>
              <span className="block text-subhead font-medium text-label">Despesa de Trabalho</span>
              <span className="text-footnote text-label-2">
                Abate do lucro do freela para apuração de contribuição
              </span>
            </div>
            <Switch
              checked={trabalho}
              onCheckedChange={setTrabalho}
              rotulo="Marca Trabalho"
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
