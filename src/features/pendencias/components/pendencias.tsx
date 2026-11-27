'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import {
  createContext,
  Suspense,
  use,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';
import { ROTAS_DO_HUB, type Pendencia } from '../tipos';

const CHAVE_STORAGE = 'controle_pendencias_dispensadas';
const EVENTO = 'controle_pendencias_change';

const SEM_PENDENCIAS: Promise<Pendencia[]> = Promise.resolve([]);

const PendenciasContext = createContext<Promise<Pendencia[]> | null>(null);

export function PendenciasProvider({
  pendencias,
  children,
}: {
  pendencias: Promise<Pendencia[]>;
  children: ReactNode;
}) {
  return <PendenciasContext value={pendencias}>{children}</PendenciasContext>;
}

/* ---------- Pendências dispensadas (X) ficam salvas no navegador ---------- */

function lerDispensadas(): string {
  try {
    return localStorage.getItem(CHAVE_STORAGE) ?? '[]';
  } catch {
    return '[]';
  }
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(EVENTO, callback);
  };
}

function dispensar(ids: string[]) {
  try {
    const atuais = new Set<string>(JSON.parse(lerDispensadas()));
    ids.forEach((id) => atuais.add(id));
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify([...atuais]));
  } catch {
    // sem storage: o aviso só some até recarregar
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Pendências ainda não dispensadas, filtradas para uma aba (inclui as filhas de um hub). */
function usePendenciasDaRota(rota: string): Pendencia[] {
  const promessa = use(PendenciasContext);
  const todas = use(promessa ?? SEM_PENDENCIAS);
  const bruto = useSyncExternalStore(subscribe, lerDispensadas, () => '[]');

  return useMemo(() => {
    let dispensadas: Set<string>;
    try {
      dispensadas = new Set(JSON.parse(bruto));
    } catch {
      dispensadas = new Set();
    }
    const rotas = [rota, ...(ROTAS_DO_HUB[rota] ?? [])];
    return todas.filter((p) => rotas.includes(p.rota) && !dispensadas.has(p.id));
  }, [todas, bruto, rota]);
}

/* ---------- Ponto laranja no item do menu ---------- */

function PontoInterno({ rota, className }: { rota: string; className?: string }) {
  const itens = usePendenciasDaRota(rota);
  if (itens.length === 0) return null;
  return (
    <span
      role="status"
      aria-label={`${itens.length} pendência(s)`}
      className={cn('block size-2 shrink-0 rounded-full bg-orange-500', className)}
    />
  );
}

export function PontoPendencia(props: { rota: string; className?: string }) {
  return (
    <Suspense fallback={null}>
      <PontoInterno {...props} />
    </Suspense>
  );
}

/* ---------- Aviso discreto com X no topo da página da aba ---------- */

function AvisoInterno() {
  const pathname = usePathname();
  const itens = usePendenciasDaRota(pathname);
  if (itens.length === 0) return null;

  return (
    <ul className="mb-4 space-y-1.5" aria-label="Pendências">
      {itens.map((p) => (
        <li key={p.id} className="flex items-center gap-2.5 text-footnote text-label-2">
          <span className="size-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
          <Link href={p.link} className="min-w-0 flex-1 truncate hover:text-label hover:underline">
            {p.texto}
          </Link>
          <button
            type="button"
            onClick={() => dispensar([p.id])}
            aria-label="Fechar aviso"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-label-2 transition-colors hover:bg-pressed hover:text-label"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function AvisoPendencias() {
  return (
    <Suspense fallback={null}>
      <AvisoInterno />
    </Suspense>
  );
}
