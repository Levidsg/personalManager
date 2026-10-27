import { getDashboardData } from '@/features/dashboard/queries';
import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { mesAtual } from '@/lib/dates';

export const dynamic = 'force-dynamic';

interface ResumoPageProps {
  searchParams: Promise<{
    mes?: string;
    visao?: 'tudo' | 'freela';
  }>;
}

export default async function ResumoPage({ searchParams }: ResumoPageProps) {
  const resolved = await searchParams;
  const competencia = resolved.mes ?? mesAtual();
  const visao = resolved.visao === 'freela' ? 'freela' : 'tudo';

  const dados = await getDashboardData(competencia, visao);

  return <DashboardShell dados={dados} />;
}
