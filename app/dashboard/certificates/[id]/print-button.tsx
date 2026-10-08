'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimer le certificat
    </button>
  );
}
