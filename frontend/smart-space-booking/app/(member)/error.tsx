'use client';

import { ErrorBagian } from '@/components/layout/error-bagian';

/** Penangkap kesalahan di dalam halaman member; navigasi tetap terlihat. */
export default function MemberError({
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
      tautanPulang="/spaces"
      labelPulang="Ke katalog"
    />
  );
}
