'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Building,
  Mail,
  Phone,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { formatarMoeda } from '@/lib/money';
import { alternarArquivado, atualizarCliente, excluirCliente } from '../actions';
import type { ClienteComMetricas } from '../queries';

export function ClienteCard({
  cliente,
  limiteConcentracao,
}: {
  cliente: ClienteComMetricas;
  limiteConcentracao: number;
}) {
  const [, startTransition] = useTransition();
  const [sheetEditarAberto, setSheetEditarAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Formulário de edição
  const [nome, setNome] = useState(cliente.nome);
  const [empresa, setEmpresa] = useState(cliente.empresa ?? '');
  const [email, setEmail] = useState(cliente.email ?? '');
  const [telefone, setTelefone] = useState(cliente.telefone ?? '');
  const [origem, setOrigem] = useState(cliente.origem ?? '');
  const [observacoes, setObservacoes] = useState(cliente.observacoes ?? '');

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome do cliente.');
      return;
    }
    try {
      setSalvando(true);
      await atualizarCliente(cliente.id, {
        nome: nome.trim(),
        empresa: empresa.trim() || null,
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        origem: origem.trim() || null,
        observacoes: observacoes.trim() || null,
        arquivado: cliente.arquivado,
      });
      toast.sucesso('Cliente atualizado com sucesso.');
      setSheetEditarAberto(false);
    } catch {
      toast.erro('Não foi possível atualizar o cliente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleToggleArquivar = () => {
    startTransition(async () => {
      try {
        await alternarArquivado(cliente.id, !cliente.arquivado);
        toast.sucesso(
          !cliente.arquivado ? `Cliente "${cliente.nome}" arquivado.` : `Cliente reativado.`,
        );
      } catch {
        toast.erro('Não foi possível alterar o status do cliente.');
      }
    });
  };

  const handleExcluir = () => {
    if (!confirm(`Deseja excluir o cliente "${cliente.nome}"?`)) return;
    startTransition(async () => {
      try {
        await excluirCliente(cliente.id);
        toast.sucesso('Cliente excluído com sucesso.');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Não foi possível excluir o cliente.';
        toast.erro(msg);
      }
    });
  };

  return (
    <>
      <div
        className={`group rounded-2xl bg-card border border-border p-4 shadow-xs space-y-3.5 hover:border-accent/40 transition-colors ${
          cliente.arquivado ? 'opacity-60 bg-card-secondary/20' : ''
        }`}
      >
        {/* Topo do Card */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/clientes/${cliente.id}`}
                className="text-subhead font-semibold text-label hover:text-accent transition-colors truncate"
              >
                {cliente.nome}
              </Link>
              {cliente.empresa && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-card-secondary text-secondary border border-border/60">
                  <Building className="size-2.5" />
                  {cliente.empresa}
                </span>
              )}
              {cliente.arquivado && (
                <span className="inline-block px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-border text-tertiary">
                  Arquivado
                </span>
              )}
            </div>

            <p className="text-caption2 text-tertiary mt-0.5">
              {cliente.qtdProjetos} projeto(s) • {cliente.projetosAtivos} ativo(s)
              {cliente.ticketMedioCentavos > 0
                ? ` • Ticket médio: ${formatarMoeda(cliente.ticketMedioCentavos)}`
                : ''}
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setSheetEditarAberto(true)}
              className="p-1.5 rounded-lg text-tertiary hover:text-label hover:bg-card-secondary transition-all cursor-pointer"
              title="Editar cliente"
              aria-label="Editar cliente"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleToggleArquivar}
              className="p-1.5 rounded-lg text-tertiary hover:text-label hover:bg-card-secondary transition-all cursor-pointer"
              title={cliente.arquivado ? 'Reativar cliente' : 'Arquivar cliente'}
              aria-label="Arquivar ou reativar cliente"
            >
              {cliente.arquivado ? (
                <ArchiveRestore className="size-3.5" />
              ) : (
                <Archive className="size-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleExcluir}
              className="p-1.5 rounded-lg text-tertiary hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              title="Excluir cliente"
              aria-label="Excluir cliente"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Faturamento e Concentração (§8.1) */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-caption2 text-tertiary block">Recebido</span>
              <span className="text-xl font-bold text-label tabular-nums">
                {formatarMoeda(cliente.totalRecebidoCentavos)}
              </span>
              {cliente.totalAReceberCentavos > 0 && (
                <span className="text-caption2 text-amber-600 dark:text-amber-400 block tabular-nums">
                  + {formatarMoeda(cliente.totalAReceberCentavos)} a receber
                </span>
              )}
            </div>
            <div className="text-right">
              <span className="text-caption2 text-tertiary block">Concentração</span>
              <span
                className={`text-subhead font-bold tabular-nums ${
                  cliente.alertaConcentracao
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-secondary'
                }`}
              >
                {cliente.percentualFormatado}
              </span>
            </div>
          </div>

          {/* Barra de Concentração */}
          <div className="h-1.5 w-full rounded-full bg-card-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cliente.alertaConcentracao ? 'bg-amber-500' : 'bg-accent'
              }`}
              style={{
                width: `${Math.min(100, cliente.percentualConcentracaoPb / 100)}%`,
              }}
            />
          </div>

          {/* Alerta de Concentração Alta (§8.1) */}
          {cliente.alertaConcentracao && (
            <div className="flex items-center gap-1.5 text-caption2 text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg mt-1">
              <AlertTriangle className="size-3 shrink-0 stroke-[2.2]" />
              <span>
                Concentração alta ({cliente.percentualFormatado}) — acima do teto de{' '}
                {limiteConcentracao}%
              </span>
            </div>
          )}
        </div>

        {/* Contatos */}
        {(cliente.telefone || cliente.email) && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-caption2">
            {cliente.telefone && (
              <a
                href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card-secondary text-secondary hover:text-label hover:bg-card transition-colors"
              >
                <Phone className="size-3 text-emerald-600 dark:text-emerald-400" />
                {cliente.telefone}
              </a>
            )}
            {cliente.email && (
              <a
                href={`mailto:${cliente.email}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-card-secondary text-secondary hover:text-label hover:bg-card transition-colors truncate"
              >
                <Mail className="size-3 text-accent" />
                <span className="truncate">{cliente.email}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Sheet de Edição */}
      <Sheet open={sheetEditarAberto} onOpenChange={setSheetEditarAberto}>
        <SheetContent titulo={`Editar Cliente: ${cliente.nome}`} descricao="Atualize dados e contatos">
          <form onSubmit={handleSalvarEdicao} className="space-y-4 py-2">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Empresa (Opcional)
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex.: Studio Alfa, Tech Corp"
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-caption1 font-medium text-secondary block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-caption1 font-medium text-secondary block mb-1.5">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex.: (11) 98888-7777"
                  className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Origem do Cliente
              </label>
              <input
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Ex.: Indicação, LinkedIn, Instagram"
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Observações
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full rounded-xl bg-card border border-border p-2.5 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <Button type="submit" disabled={salvando} className="w-full mt-3">
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
