'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatarMoeda, type Centavos } from '@/lib/money';

interface DeltaInfo {
  percentual: number;
  positivo: boolean;
  texto?: string;
}

interface IndicadoresProps {
  visao: 'tudo' | 'freela';
  comparar: boolean;
  dadosTudo: {
    ganhos: { valor: Centavos; delta: DeltaInfo };
    despesas: { valor: Centavos; delta: DeltaInfo };
    saldo: { valor: Centavos; delta: DeltaInfo };
    assinaturas: { valor: Centavos; qtdAtivas: number };
  };
  dadosFreela: {
    recebido: { valor: Centavos; delta: DeltaInfo };
    aReceber: { valor: Centavos; qtdParcelas: number };
    despesasTrabalho: { valor: Centavos; delta: DeltaInfo };
    lucro: { valor: Centavos; margemFormatada: string; delta: DeltaInfo };
  };
}

export function IndicadoresFaixa({
  visao,
  comparar,
  dadosTudo,
  dadosFreela,
}: IndicadoresProps) {
  if (visao === 'tudo') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Ganhos Totais */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">Ganhos Totais</span>
          <span className="text-title3 sm:text-title2 font-bold text-label tabular-nums block">
            {formatarMoeda(dadosTudo.ganhos.valor)}
          </span>
          {comparar && (
            <div className="flex items-center gap-1 text-[11px] font-medium pt-0.5">
              {dadosTudo.ganhos.delta.positivo ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3" />
                  {dadosTudo.ganhos.delta.texto}
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-500">
                  <ArrowDownRight className="size-3" />
                  {dadosTudo.ganhos.delta.texto}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Despesas Totais */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">Despesas Totais</span>
          <span className="text-title3 sm:text-title2 font-bold text-label tabular-nums block">
            {formatarMoeda(dadosTudo.despesas.valor)}
          </span>
          {comparar && (
            <div className="flex items-center gap-1 text-[11px] font-medium pt-0.5">
              {dadosTudo.despesas.delta.positivo ? (
                <span className="inline-flex items-center gap-0.5 text-red-500">
                  <ArrowUpRight className="size-3" />
                  {dadosTudo.despesas.delta.texto}
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ArrowDownRight className="size-3" />
                  {dadosTudo.despesas.delta.texto}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Saldo Total */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">Saldo Total</span>
          <span
            className={`text-title3 sm:text-title2 font-bold tabular-nums block ${
              dadosTudo.saldo.valor >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500'
            }`}
          >
            {formatarMoeda(dadosTudo.saldo.valor)}
          </span>
          {comparar && (
            <div className="flex items-center gap-1 text-[11px] font-medium pt-0.5">
              {dadosTudo.saldo.delta.positivo ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3" />
                  {dadosTudo.saldo.delta.texto}
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-red-500">
                  <ArrowDownRight className="size-3" />
                  {dadosTudo.saldo.delta.texto}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Assinaturas */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
          <span className="text-caption2 text-tertiary block">Assinaturas no Mês</span>
          <span className="text-title3 sm:text-title2 font-bold text-label tabular-nums block">
            {formatarMoeda(dadosTudo.assinaturas.valor)}
          </span>
          <span className="text-[11px] text-tertiary block pt-0.5">
            {dadosTudo.assinaturas.qtdAtivas} ativa(s)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Recebido Freela */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
        <span className="text-caption2 text-tertiary block">Recebido (Caixa)</span>
        <span className="text-title3 sm:text-title2 font-bold text-emerald-600 dark:text-emerald-400 tabular-nums block">
          {formatarMoeda(dadosFreela.recebido.valor)}
        </span>
        {comparar && (
          <div className="flex items-center gap-1 text-[11px] font-medium pt-0.5">
            {dadosFreela.recebido.delta.positivo ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                {dadosFreela.recebido.delta.texto}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-red-500">
                <ArrowDownRight className="size-3" />
                {dadosFreela.recebido.delta.texto}
              </span>
            )}
          </div>
        )}
      </div>

      {/* A Receber Freela */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
        <span className="text-caption2 text-tertiary block">A Receber no Mês</span>
        <span className="text-title3 sm:text-title2 font-bold text-label tabular-nums block">
          {formatarMoeda(dadosFreela.aReceber.valor)}
        </span>
        <span className="text-[11px] text-tertiary block pt-0.5">
          {dadosFreela.aReceber.qtdParcelas} parcela(s)
        </span>
      </div>

      {/* Despesas de Trabalho */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
        <span className="text-caption2 text-tertiary block">Despesas de Trabalho</span>
        <span className="text-title3 sm:text-title2 font-bold text-label tabular-nums block">
          {formatarMoeda(dadosFreela.despesasTrabalho.valor)}
        </span>
        {comparar && (
          <div className="flex items-center gap-1 text-[11px] font-medium pt-0.5">
            {dadosFreela.despesasTrabalho.delta.positivo ? (
              <span className="inline-flex items-center gap-0.5 text-red-500">
                <ArrowUpRight className="size-3" />
                {dadosFreela.despesasTrabalho.delta.texto}
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <ArrowDownRight className="size-3" />
                {dadosFreela.despesasTrabalho.delta.texto}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lucro Freela */}
      <div className="p-4 rounded-2xl bg-card border border-border space-y-1 shadow-xs">
        <span className="text-caption2 text-tertiary block">Lucro do Estúdio</span>
        <span
          className={`text-title3 sm:text-title2 font-bold tabular-nums block ${
            dadosFreela.lucro.valor >= 0 ? 'text-accent' : 'text-red-500'
          }`}
        >
          {formatarMoeda(dadosFreela.lucro.valor)}
        </span>
        <span className="text-[11px] text-tertiary block pt-0.5 font-medium">
          Margem: {dadosFreela.lucro.margemFormatada}
        </span>
      </div>
    </div>
  );
}
