import { getConfiguracoes } from '@/features/ajustes/queries';
import { AjustesForm } from '@/features/ajustes/components/ajustes-form';

export default async function AjustesPage() {
  const config = await getConfiguracoes();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title1 font-bold tracking-tight text-label">Ajustes</h2>
        <p className="text-subhead text-label-2 mt-1">
          Personalização, parâmetros financeiros, regras de rateio e exportação de dados.
        </p>
      </div>

      <AjustesForm
        initialConfig={{
          nomeApp: config.nomeApp,
          nomeExibicao: config.nomeExibicao,
          salarioBaseCentavos: config.salarioBaseCentavos,
          moduloContribuicaoAtivo: config.moduloContribuicaoAtivo,
          contribuicaoBase: config.contribuicaoBase,
          limiteConcentracaoCliente: config.limiteConcentracaoCliente,
        }}
      />
    </div>
  );
}
