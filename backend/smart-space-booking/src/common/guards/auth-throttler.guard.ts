import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

/**
 * ThrottlerGuard bawaan membalas "ThrottlerException: Too Many Requests", yang
 * berbahasa Inggris dan menyebut nama kelas internal. Pesannya diganti agar
 * seragam dengan error lain dan dapat langsung ditampilkan di form login.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Terlalu banyak percobaan. Silakan coba lagi dalam satu menit!',
    );
  }
}
