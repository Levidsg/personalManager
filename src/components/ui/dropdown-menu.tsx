'use client';

import { DropdownMenu as RadixDropdown } from 'radix-ui';
import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuGroup = RadixDropdown.Group;
export const DropdownMenuPortal = RadixDropdown.Portal;

export interface DropdownMenuContentProps
  extends ComponentPropsWithoutRef<typeof RadixDropdown.Content> {
  children: ReactNode;
}

export function DropdownMenuContent({
  children,
  className,
  sideOffset = 6,
  ...props
}: DropdownMenuContentProps) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        className={cn(
          'material z-50 min-w-[180px] overflow-hidden rounded-control p-1 text-subhead shadow-float border border-separator',
          'animate-pop',
          className,
        )}
        {...props}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

export interface DropdownMenuItemProps extends ComponentPropsWithoutRef<typeof RadixDropdown.Item> {
  destrutivo?: boolean;
}

export function DropdownMenuItem({
  className,
  destrutivo,
  ...props
}: DropdownMenuItemProps) {
  return (
    <RadixDropdown.Item
      className={cn(
        'relative flex min-h-[36px] cursor-pointer items-center gap-2 rounded-xs px-2.5 py-1.5 text-subhead font-medium outline-none select-none transition-colors',
        'focus:bg-fill focus:text-label data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        destrutivo ? 'text-negative focus:text-negative' : 'text-label',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Separator>) {
  return (
    <RadixDropdown.Separator
      className={cn('my-1 h-[0.5px] bg-separator', className)}
      {...props}
    />
  );
}
