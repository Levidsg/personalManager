'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variante="primario"
      onClick={handlePrint}
      className="flex items-center gap-2 shadow-xs cursor-pointer"
    >
      <Printer className="size-4" />
      <span>Salvar PDF / Imprimir</span>
    </Button>
  );
}
