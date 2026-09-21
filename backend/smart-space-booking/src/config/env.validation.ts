import * as Joi from 'joi';

const JAM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3001'),
  DATABASE_URL: Joi.string()
    .required()
    .messages({ 'any.required': 'DATABASE_URL wajib diisi pada file .env' }),
  JWT_SECRET: Joi.string().min(16).required().messages({
    'any.required': 'JWT_SECRET wajib diisi pada file .env',
    'string.min': 'JWT_SECRET minimal 16 karakter',
  }),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  TZ: Joi.string().default('Asia/Jakarta'),
  UPLOAD_MAX_SIZE_MB: Joi.number().min(1).max(20).default(2),
  JAM_OPERASIONAL_BUKA: Joi.string().pattern(JAM_PATTERN).default('07:00'),
  JAM_OPERASIONAL_TUTUP: Joi.string().pattern(JAM_PATTERN).default('22:00'),
  STRICT_CHECKIN_DATE: Joi.boolean().default(true),
  // Kosong berarti foto disimpan di folder uploads/ lokal.
  CLOUDINARY_URL: Joi.string()
    .pattern(/^cloudinary:\/\/[^:]+:[^@]+@.+$/)
    .allow('')
    .optional()
    .messages({
      'string.pattern.base':
        'CLOUDINARY_URL harus berbentuk cloudinary://<api_key>:<api_secret>@<cloud_name>',
    }),
  CLOUDINARY_FOLDER: Joi.string().default('smart-space-booking'),
}).custom((value: Record<string, string>, helpers) => {
  if (value.JAM_OPERASIONAL_BUKA >= value.JAM_OPERASIONAL_TUTUP) {
    return helpers.message({
      custom:
        'JAM_OPERASIONAL_TUTUP harus lebih besar dari JAM_OPERASIONAL_BUKA',
    });
  }
  return value;
});
