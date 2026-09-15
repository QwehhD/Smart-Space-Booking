import { OpenAPIObject } from '@nestjs/swagger';

/**
 * Menyusun koleksi Postman dari dokumen OpenAPI yang sudah ada.
 *
 * Dibuat dengan menurunkan dari Swagger, bukan ditulis tangan, supaya kedua
 * berkas tidak pernah berbeda isi: setiap endpoint atau parameter baru cukup
 * ditambahkan sekali pada controller.
 */

interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: { key: string; value: string }[];
    url: { raw: string; host: string[]; path: string[]; query?: unknown[] };
    body?: { mode: 'raw'; raw: string; options: unknown };
    auth?: unknown;
  };
}

type Operasi = {
  summary?: string;
  operationId?: string;
  tags?: string[];
  security?: unknown[];
  parameters?: { name: string; in: string; required?: boolean }[];
  requestBody?: unknown;
};

const METODE = ['get', 'post', 'put', 'patch', 'delete'] as const;

export function bangunKoleksiPostman(dokumen: OpenAPIObject) {
  const folder = new Map<string, PostmanItem[]>();

  for (const [path, operasiPerPath] of Object.entries(dokumen.paths ?? {})) {
    for (const metode of METODE) {
      const operasi = (operasiPerPath as Record<string, Operasi>)[metode];

      if (!operasi) {
        continue;
      }

      const tag = operasi.tags?.[0] ?? 'Lainnya';
      const daftar = folder.get(tag) ?? [];

      daftar.push(bangunItem(path, metode, operasi, dokumen));
      folder.set(tag, daftar);
    }
  }

  return {
    info: {
      name: dokumen.info.title,
      description: dokumen.info.description,
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    // Variabel koleksi supaya alamat server, app key, dan token cukup diisi
    // sekali lalu dipakai seluruh request.
    variable: [
      { key: 'base_url', value: 'http://localhost:3000' },
      { key: 'maker_key', value: 'mk_default_ukk_2026' },
      { key: 'access_token', value: '' },
    ],
    item: [...folder.entries()].map(([nama, daftar]) => ({
      name: nama,
      item: daftar,
    })),
  };
}

function bangunItem(
  path: string,
  metode: string,
  operasi: Operasi,
  dokumen: OpenAPIObject,
): PostmanItem {
  // Path OpenAPI memakai {id}, sedangkan Postman memakai :id.
  const pathPostman = path.replace(/\{(\w+)\}/g, ':$1');
  const segmen = pathPostman.split('/').filter(Boolean);

  const header = [{ key: 'x-maker-key', value: '{{maker_key}}' }];
  const perluToken = Boolean(operasi.security?.length);

  if (perluToken) {
    header.push({ key: 'Authorization', value: 'Bearer {{access_token}}' });
  }

  const punyaBody = Boolean(operasi.requestBody);

  if (punyaBody) {
    header.push({ key: 'Content-Type', value: 'application/json' });
  }

  const query = (operasi.parameters ?? [])
    .filter((p) => p.in === 'query')
    .map((p) => ({ key: p.name, value: '', disabled: !p.required }));

  return {
    name: operasi.summary ?? `${metode.toUpperCase()} ${path}`,
    request: {
      method: metode.toUpperCase(),
      header,
      url: {
        raw: `{{base_url}}${pathPostman}`,
        host: ['{{base_url}}'],
        path: segmen,
        ...(query.length > 0 && { query }),
      },
      ...(punyaBody && {
        body: {
          mode: 'raw' as const,
          raw: contohBody(operasi, dokumen),
          options: { raw: { language: 'json' } },
        },
      }),
    },
  };
}

/**
 * Contoh body diambil dari nilai `example` pada DTO, sehingga request di Postman
 * langsung dapat dijalankan tanpa diisi manual lebih dulu.
 */
function contohBody(operasi: Operasi, dokumen: OpenAPIObject): string {
  const ref = (
    operasi.requestBody as {
      content?: Record<string, { schema?: { $ref?: string } }>;
    }
  )?.content?.['application/json']?.schema?.$ref;

  const nama = ref?.split('/').pop();
  const skema = nama
    ? (
        dokumen.components?.schemas as Record<
          string,
          { properties?: Record<string, { example?: unknown }> }
        >
      )?.[nama]
    : undefined;

  if (!skema?.properties) {
    return '{}';
  }

  const contoh = Object.fromEntries(
    Object.entries(skema.properties).map(([field, info]) => [
      field,
      info.example ?? '',
    ]),
  );

  return JSON.stringify(contoh, null, 2);
}
