import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/cn';

export type SkeletonProps = ComponentPropsWithRef<'div'>;

/**
 * Skeleton com pulso discreto e sem gradientes chamativos (§6.8, §6.13).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-skeleton rounded-control bg-fill', className)}
      aria-hidden="true"
      {...props}
    />
  );
}
