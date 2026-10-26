'use client';

import { useState } from 'react';
import { Eye, ShieldCheck } from 'lucide-react';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useAparencia, type Aparencia } from '@/hooks/use-aparencia';
import { usePrivacidade } from '@/hooks/use-privacidade';
import type { Centavos } from '@/lib/money';

export default function AjustesPage() {
  const { aparencia, setAparencia } = useAparencia();
  const { privacidadeAtiva, togglePrivacidade } = usePrivacidade();

  const [nomeApp, setNomeApp] = useState('Controle');
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [salarioBase, setSalarioBase] = useState<Centavos>(500000); // R$ 5.000,00
  const [moduloContribuicao, setModuloContribuicao] = useState(true);

  const salvarAjustes = () => {
    toast.sucesso('Ajustes salvos com sucesso');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title1 font-bold tracking-tight text-label">Ajustes</h2>
        <p className="text-subhead text-label-2 mt-1">
          Personalização, preferências de exibição e parâmetros financeiros.
        </p>
      </div>

      {/* Aparência */}
      <InsetGroup titulo="Aparência" rodape="Automático acompanha a preferência do seu dispositivo.">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-headline font-medium text-label">Tema</span>
            <SegmentedControl
              itens={[
                { valor: 'sistema', rotulo: 'Sistema' },
                { valor: 'claro', rotulo: 'Claro' },
                { valor: 'escuro', rotulo: 'Escuro' },
              ]}
              valor={aparencia}
              onChange={(v) => setAparencia(v as Aparencia)}
              rotuloAcessivel="Seleção de tema"
            />
          </div>
        </div>
      </InsetGroup>

      {/* Identificação */}
      <InsetGroup titulo="Identificação do App">
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="nome-app" className="block text-subhead font-medium text-label-2 mb-1.5">
              Nome do aplicativo
            </label>
            <input
              id="nome-app"
              type="text"
              value={nomeApp}
              onChange={(e) => setNomeApp(e.target.value)}
              placeholder="Controle"
              className="h-11 w-full rounded-field bg-fill px-3.5 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="nome-exibicao" className="block text-subhead font-medium text-label-2 mb-1.5">
              Seu nome de exibição (opcional)
            </label>
            <input
              id="nome-exibicao"
              type="text"
              value={nomeExibicao}
              onChange={(e) => setNomeExibicao(e.target.value)}
              placeholder="Ex: Levi"
              className="h-11 w-full rounded-field bg-fill px-3.5 text-headline text-label font-medium outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      </InsetGroup>

      {/* Parâmetros financeiros */}
      <InsetGroup titulo="Finanças e Salário" rodape="O salário base entra no cálculo de ganhos de todos os meses.">
        <div className="p-4 space-y-4">
          <CurrencyInput
            id="salario-base"
            rotulo="Salário base mensal"
            value={salarioBase}
            onChange={setSalarioBase}
          />
        </div>

        <GroupRow
          titulo="Módulo de Contribuição"
          subtitulo="Dízimo e ofertas calculados sobre a base"
          acao={
            <Switch
              checked={moduloContribuicao}
              onCheckedChange={setModuloContribuicao}
              rotulo="Ativar módulo de contribuição"
            />
          }
        />
      </InsetGroup>

      {/* Privacidade e segurança */}
      <InsetGroup titulo="Privacidade">
        <GroupRow
          icone={<Eye className="size-5 text-accent" strokeWidth={1.75} />}
          titulo="Ocultar valores monetários"
          subtitulo="Mascara valores em todo o app (••••••)"
          acao={
            <Switch
              checked={privacidadeAtiva}
              onCheckedChange={togglePrivacidade}
              rotulo="Modo privacidade"
            />
          }
        />
        <GroupRow
          icone={<ShieldCheck className="size-5 text-positive" strokeWidth={1.75} />}
          titulo="Segurança da conta"
          subtitulo="App monousuário, sem login. Protegido no servidor"
        />
      </InsetGroup>

      <div className="pt-2">
        <Button larguraTotal onClick={salvarAjustes}>
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
