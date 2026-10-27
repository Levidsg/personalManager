import type { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'padrao' | 'outline' | 'sucesso' | 'aviso' | 'erro' | 'secundario';
}

export function Badge({
  children,
  variant = 'padrao',
  className = '',
  ...props
}: BadgeProps) {
  const base =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide transition-colors';

  const variantes = {
    padrao: 'bg-card-secondary text-secondary border border-border/60',
    outline: 'border border-border text-secondary bg-transparent',
    secundario: 'bg-card text-tertiary border border-border/40',
    sucesso: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    aviso: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    erro: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
  };

  return (
    <span className={`${base} ${variantes[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
