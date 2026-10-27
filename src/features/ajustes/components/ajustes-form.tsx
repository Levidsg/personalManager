'use client';

import { useState, useTransition } from 'react';
import { Download, Eye, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { InsetGroup, GroupRow } from '@/components/ui/grouped-list';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { useAparencia, type Aparencia } from '@/hooks/use-aparencia';
import { usePrivacidade } from '@/hooks/use-privacidade';
import type { Centavos } from '@/lib/money';
import { salvarConfiguracoes } from '../actions';

export interface AjustesFormProps {
  initialConfig: {
    nomeApp: string;
    nomeExibicao: string | null;
    salarioBaseCentavos: Centavos;
    moduloContribuicaoAtivo: boolean;
    contribuicaoBase: 'lucro' | 'bruta';
    limiteConcentracaoCliente: number;
  };
}

export function AjustesForm({ initialConfig }: AjustesFormProps) {
  const { aparencia, setAparencia } = useAparencia();
  const { privacidadeAtiva, togglePrivacidade } = usePrivacidade();
  const [salvando, startTransition] = useTransition();

  const [nomeApp, setNomeApp] = useState(initialConfig.nomeApp);
  const [nomeExibicao, setNomeExibicao] = useState(initialConfig.nomeExibicao ?? '');
  const [salarioBase, setSalarioBase] = useState<Centavos>(initialConfig.salarioBaseCentavos);
  const [moduloContribuicao, setModuloContribuicao] = useState(initialConfig.moduloContribuicaoAtivo);
  const [contribuicaoBase, setContribuicaoBase] = useState<'lucro' | 'bruta'>(initialConfig.contribuicaoBase);
  const [limiteConcentracao, setLimiteConcentracao] = useState(initialConfig.limiteConcentracaoCliente);

  const handleSalvar = () => {
    startTransition(async () => {
      try {
        await salvarConfiguracoes({
          nomeApp,
          nomeExibicao,
          salarioBaseCentavos: salarioBase,
          moduloContribuicaoAtivo: moduloContribuicao,
          contribuicaoBase,
          limiteConcentracaoCliente: limiteConcentracao,
        });
        toast.sucesso('Configurações salvas com sucesso!');
      } catch {
        toast.erro('Não foi possível salvar as configurações.');
      }
    });
  };

  return (
    <div className="space-y-6">
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
      <InsetGroup
        titulo="Finanças Pessoais"
        rodape="O salário base entra no cálculo de ganhos de todos os meses como valor de referência."
      >
        <div className="p-4 space-y-3">
          <label className="block text-subhead font-medium text-label-2">
            Salário base mensal (R$)
          </label>
          <CurrencyInput
            value={salarioBase}
            onChange={setSalarioBase}
            className="w-full text-2xl font-bold"
          />
        </div>

        <GroupRow
          titulo="Módulo de Contribuição Familiar & Dízimo"
          subtitulo="Calcula rateios automáticos sobre a base mensal"
          acao={
            <Switch
              checked={moduloContribuicao}
              onCheckedChange={setModuloContribuicao}
            />
          }
        />

        {moduloContribuicao && (
          <div className="p-4 bg-card-secondary/40 border-t border-border/40 space-y-2">
            <span className="block text-caption1 font-medium text-secondary">
              Base de Cálculo da Contribuição
            </span>
            <SegmentedControl
              itens={[
                { valor: 'lucro', rotulo: 'Lucro Líquido (Deduz custos de Freela)' },
                { valor: 'bruta', rotulo: 'Faturamento Bruto' },
              ]}
              valor={contribuicaoBase}
              onChange={(v) => setContribuicaoBase(v as 'lucro' | 'bruta')}
            />
          </div>
        )}
      </InsetGroup>

      {/* Freela Studio Parâmetros */}
      <InsetGroup
        titulo="Freelancer Studio"
        rodape="Alertas quando o faturamento vindo de um único cliente ultrapassar este limite percentual."
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-subhead font-medium text-label block">
                Limite de Concentração de Cliente
              </span>
              <span className="text-caption2 text-secondary block">
                Padrão recomendado: 40%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={10}
                max={100}
                value={limiteConcentracao}
                onChange={(e) => setLimiteConcentracao(Number(e.target.value))}
                className="w-20 rounded-xl bg-card border border-border px-3 py-1.5 text-center font-bold text-label focus:outline-none focus:ring-1 focus:ring-accent tabular-nums"
              />
              <span className="text-subhead font-bold text-label">%</span>
            </div>
          </div>
        </div>
      </InsetGroup>

      {/* Privacidade e segurança */}
      <InsetGroup titulo="Privacidade & Segurança">
        <GroupRow
          icone={<Eye className="size-5 text-accent" strokeWidth={1.75} />}
          titulo="Ocultar valores monetários"
          subtitulo="Mascara valores em todo o app (••••••) com um clique"
          acao={
            <Switch
              checked={privacidadeAtiva}
              onCheckedChange={togglePrivacidade}
            />
          }
        />
        <GroupRow
          icone={<ShieldCheck className="size-5 text-emerald-500" strokeWidth={1.75} />}
          titulo="Segurança da conta"
          subtitulo="App monousuário sem login. RLS ativado no PostgreSQL"
        />
      </InsetGroup>

      {/* Exportação de Dados (§7.8, P1) */}
      <InsetGroup
        titulo="Exportação & Backup"
        rodape="Exporte seus dados a qualquer momento em formatos abertos e portáveis."
      >
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variante="secundario"
            asChild
            className="w-full flex items-center justify-center gap-2"
          >
            <a href="/api/export?formato=json" download>
              <Download className="size-4" />
              Backup Completo (JSON)
            </a>
          </Button>

          <Button
            variante="secundario"
            asChild
            className="w-full flex items-center justify-center gap-2"
          >
            <a href="/api/export?formato=csv" download>
              <FileSpreadsheet className="size-4" />
              Lançamentos (CSV)
            </a>
          </Button>
        </div>
      </InsetGroup>

      {/* Botão de Salvar Alterações */}
      <div className="pt-2">
        <Button
          larguraTotal
          onClick={handleSalvar}
          disabled={salvando}
          className="shadow-sm"
        >
          {salvando ? 'Salvando alterações...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}
