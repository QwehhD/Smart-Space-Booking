import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ValidationErrorDetail } from '../interfaces/api-response.interface';

const flattenValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): ValidationErrorDetail[] =>
  errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const messages = Object.values(error.constraints ?? {});
    const nested = error.children?.length
      ? flattenValidationErrors(error.children, field)
      : [];

    return messages.length ? [{ field, messages }, ...nested] : nested;
  });

/**
 * Mengubah error class-validator menjadi satu pesan ringkas untuk ditampilkan
 * sebagai notifikasi, plus rincian per field agar frontend bisa menandai
 * input mana yang salah.
 */
export const validationExceptionFactory = (
  errors: ValidationError[],
): BadRequestException => {
  const details = flattenValidationErrors(errors);
  const message = details.map((detail) => detail.messages[0]).join(', ');

  return new BadRequestException({
    message: message || 'Data yang dikirim tidak valid',
    errors: details,
  });
};
