'use client';

import { Switch as RadixSwitch } from 'radix-ui';
import { type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/cn';

export interface SwitchProps extends ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  rotulo?: string;
}

/**
 * Interruptor no estilo iOS (§6.8).
 * Alvo de toque de 44px garantido no celular.
 */
export function Switch({ className, rotulo, ...props }: SwitchProps) {
  return (
    <div className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center">
      <RadixSwitch.Root
        aria-label={rotulo}
        className={cn(
          'peer inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-positive data-[state=unchecked]:bg-fill',
          className,
        )}
        {...props}
      >
        <RadixSwitch.Thumb
          className={cn(
            'pointer-events-none block size-[27px] rounded-full bg-surface shadow-xs ring-0 transition-transform duration-200 ease-in-out',
            'data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0',
          )}
        />
      </RadixSwitch.Root>
    </div>
  );
}
