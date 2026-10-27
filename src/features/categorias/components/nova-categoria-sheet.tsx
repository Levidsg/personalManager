'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { IconPicker } from '@/components/ui/icon-picker';
import { toast } from '@/components/ui/toast';
import type { ChaveCor, ChaveIcone } from '@/lib/icons';
import { criarCategoria } from '../actions';

export function NovaCategoriaSheet() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [natureza, setNatureza] = useState<'fixo' | 'variavel'>('variavel');
  const [icone, setIcone] = useState<ChaveIcone>('mercado');
  const [cor, setCor] = useState<ChaveCor>('laranja');
  const [trabalhoPadrao, setTrabalhoPadrao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome da categoria.');
      return;
    }

    try {
      setSalvando(true);
      await criarCategoria({
        nome,
        natureza,
        icone,
        cor,
        trabalhoPadrao,
      });
      toast.sucesso('Categoria criada com sucesso.');
      setNome('');
      setAberto(false);
    } catch (err) {
      toast.erro(err instanceof Error ? err.message : 'Erro ao criar categoria.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button icone={<Plus className="size-4" strokeWidth={2} />}>
          Nova categoria
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Nova Categoria"
        descricao="Crie categorias fixas ou variáveis para organizar suas despesas."
        rodape={
          <Button
            larguraTotal
            disabled={salvando || !nome.trim()}
            onClick={handleSubmit}
          >
            {salvando ? 'Salvando...' : 'Salvar categoria'}
          </Button>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-nome" className="block text-subhead font-medium text-label-2 mb-1.5">
              Nome da categoria
            </label>
            <input
              id="cat-nome"
              type="text"
              placeholder="Ex: Transporte por aplicativo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="h-11 w-full rounded-field bg-fill px-3.5 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-subhead font-medium text-label-2 mb-1.5">
              Natureza da despesa
            </label>
            <SegmentedControl
              itens={[
                { valor: 'fixo', rotulo: 'Fixo (Essencial)' },
                { valor: 'variavel', rotulo: 'Variável (Flutuante)' },
              ]}
              valor={natureza}
              onChange={setNatureza}
              rotuloAcessivel="Natureza da despesa"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="block text-subhead font-medium text-label">Ícone e Cor</span>
              <span className="text-footnote text-label-2">Identificação visual na lista</span>
            </div>
            <IconPicker
              icone={icone}
              cor={cor}
              onChangeIcone={setIcone}
              onChangeCor={setCor}
            />
          </div>

          <div className="flex items-center justify-between border-t border-separator pt-3">
            <div>
              <span className="block text-subhead font-medium text-label">Trabalho padrão</span>
              <span className="text-footnote text-label-2">
                Ativa automaticamente a marca Trabalho em novos lançamentos
              </span>
            </div>
            <Switch
              checked={trabalhoPadrao}
              onCheckedChange={setTrabalhoPadrao}
              rotulo="Trabalho padrão"
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
