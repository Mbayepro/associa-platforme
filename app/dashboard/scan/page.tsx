import { Suspense } from 'react';
import { ScannerClient } from './scanner-client';

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScannerClient />
    </Suspense>
  );
}
