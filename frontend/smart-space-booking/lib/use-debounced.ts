'use client';

import { useEffect, useState } from 'react';

/**
 * Menunda perubahan nilai.
 *
 * Dipakai agar pengecekan ketersediaan tidak dikirim satu kali per ketikan atau
 * per perubahan pilihan, melainkan setelah pengguna berhenti mengubah sejenak.
 */
export function useDebounced<T>(nilai: T, jeda = 400): T {
  const [tertunda, setTertunda] = useState(nilai);

  useEffect(() => {
    const timer = setTimeout(() => setTertunda(nilai), jeda);
    return () => clearTimeout(timer);
  }, [nilai, jeda]);

  return tertunda;
}
