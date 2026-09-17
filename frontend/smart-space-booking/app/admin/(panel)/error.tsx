'use client';

import { ErrorBagian } from '@/components/layout/error-bagian';

/** Penangkap kesalahan di dalam panel pengelola; sidebar tetap terlihat. */
export default function PanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBagian
      error={error}
      reset={reset}
      tautanPulang="/admin/dashboard"
      labelPulang="Ke dashboard"
    />
  );
}
