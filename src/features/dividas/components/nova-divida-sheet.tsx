'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from '@/components/ui/toast';
import { type Centavos } from '@/lib/money';
import { criarDivida } from '../actions';

export function NovaDividaSheet({ tipoPadrao = 'minha' }: { tipoPadrao?: 'minha' | 'me_devem' }) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<'minha' | 'me_devem'>(tipoPadrao);
  const [pessoa, setPessoa] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valorOriginalCentavos, setValorOriginalCentavos] = useState<Centavos>(0);
  const [vencimento, setVencimento] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pessoa.trim()) {
      toast.erro('Informe o nome da pessoa ou instituição.');
      return;
    }
    if (!descricao.trim()) {
      toast.erro('Informe a descrição ou motivo.');
      return;
    }
    if (valorOriginalCentavos <= 0) {
      toast.erro('Informe um valor original maior que zero.');
      return;
    }

    try {
      setSalvando(true);
      await criarDivida({
        tipo,
        pessoa: pessoa.trim(),
        descricao: descricao.trim(),
        valorOriginalCentavos,
        vencimento: vencimento || null,
      });
      toast.sucesso('Registro cadastrado com sucesso!');
      setAberto(false);
      setPessoa('');
      setDescricao('');
      setValorOriginalCentavos(0);
      setVencimento('');
    } catch {
      toast.erro('Não foi possível salvar o registro.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Novo Registro
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Nova Dívida / Empréstimo"
        descricao="Cadastre valores que você precisa pagar ou receber"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Segmented: Minhas Dívidas vs Me Devem */}
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Tipo de Registro
            </label>
            <SegmentedControl
              itens={[
                { valor: 'minha', rotulo: 'Eu Devo (A Pagar)' },
                { valor: 'me_devem', rotulo: 'Me Devem (A Receber)' },
              ]}
              valor={tipo}
              onChange={(v) => setTipo(v as 'minha' | 'me_devem')}
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              {tipo === 'minha' ? 'Credor (para quem você deve)' : 'Devedor (quem deve para você)'}
            </label>
            <input
              type="text"
              value={pessoa}
              onChange={(e) => setPessoa(e.target.value)}
              placeholder="Ex.: João Silva, Banco Inter, Amigo"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Descrição do Empréstimo
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Empréstimo reforma, Compra parcelada combinada"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Valor Total Original
            </label>
            <CurrencyInput
              value={valorOriginalCentavos}
              onChange={setValorOriginalCentavos}
              className="w-full text-2xl font-bold"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Data Prevista de Quitação (Opcional)
            </label>
            <input
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Button type="submit" disabled={salvando} className="w-full mt-3">
            {salvando ? 'Salvando...' : 'Cadastrar Registro'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
