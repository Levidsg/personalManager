'use client';

import { type ChangeEvent, type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';
import { type Centavos, digitosParaCentavos, formatarDecimal } from '@/lib/money';

export interface CurrencyInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'onChange'> {
  value: Centavos;
  onChange: (valorCentavos: Centavos) => void;
  rotulo?: string;
  erro?: string;
  simbolo?: string;
}

/**
 * Campo monetário (§6.8, §6.12):
 * - Digitação orientada a centavos que desloca a vírgula da direita para a esquerda.
 * - `inputMode="numeric"` para abrir o teclado numérico no celular.
 * - Fonte mínima de 16px para evitar auto-zoom no iOS Safari.
 * - Números tabulares para alinhamento estável.
 */
export function CurrencyInput({
  value,
  onChange,
  rotulo,
  erro,
  simbolo = 'R$',
  className,
  id,
  disabled,
  ...props
}: CurrencyInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const novosCentavos = digitosParaCentavos(e.target.value);
    onChange(novosCentavos);
  };

  const valorFormatado = formatarDecimal(value);

  return (
    <div className="w-full">
      {rotulo && (
        <label htmlFor={id} className="mb-1.5 block text-subhead font-medium text-label-2">
          {rotulo}
        </label>
      )}
      <div
        className={cn(
          'relative flex h-11 w-full items-center rounded-field bg-fill px-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent',
          disabled && 'opacity-50',
          erro && 'ring-2 ring-negative',
          className,
        )}
      >
        {simbolo && (
          <span className="mr-2 text-headline font-semibold text-label-2 select-none">
            {simbolo}
          </span>
        )}
        <input
          {...props}
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={valorFormatado}
          onChange={handleChange}
          className="tabular h-full w-full bg-transparent text-headline font-semibold text-label outline-none placeholder:text-label-2"
        />
      </div>
      {erro && <p className="mt-1 text-footnote text-negative">{erro}</p>}
    </div>
  );
}
