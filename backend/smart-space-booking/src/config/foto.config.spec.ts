import { buildFotoUrl } from '../common/utils/foto.util';
import { publicIdCloudinary } from '../upload/penyimpanan-foto';
import { konfigurasiFoto } from './configuration';

/**
 * Kolom `foto` di database hanya berisi nama berkas, jadi yang harus dijaga
 * adalah URL yang dibentuk darinya tetap menunjuk ke berkas yang benar-benar
 * tersimpan, baik di folder lokal maupun di Cloudinary.
 */
describe('konfigurasi foto', () => {
  it('memakai folder uploads lokal bila CLOUDINARY_URL kosong', () => {
    const konfig = konfigurasiFoto({ CLOUDINARY_URL: '' }, 'http://api.test');

    expect(konfig.penyimpanan).toBe('lokal');
    expect(buildFotoUrl(konfig.baseUrl, 'spaces', 'a.jpg')).toBe(
      'http://api.test/uploads/spaces/a.jpg',
    );
  });

  it('membaca kredensial dari CLOUDINARY_URL', () => {
    const konfig = konfigurasiFoto(
      { CLOUDINARY_URL: 'cloudinary://123456:rahasia@awan-uji' },
      'http://api.test',
    );

    if (konfig.penyimpanan !== 'cloudinary')
      throw new Error('bukan cloudinary');
    expect(konfig.cloudinary).toEqual({
      cloudName: 'awan-uji',
      apiKey: '123456',
      apiSecret: 'rahasia',
      folder: 'smart-space-booking',
    });
  });

  it('membentuk URL yang cocok dengan public_id hasil unggahan', () => {
    const konfig = konfigurasiFoto(
      {
        CLOUDINARY_URL: 'cloudinary://123456:rahasia@awan-uji',
        CLOUDINARY_FOLDER: 'ssb',
      },
      'http://api.test',
    );
    if (konfig.penyimpanan !== 'cloudinary')
      throw new Error('bukan cloudinary');

    const url = buildFotoUrl(konfig.baseUrl, 'members', '17-42.jpeg');
    const publicId = publicIdCloudinary(
      konfig.cloudinary,
      'members',
      '17-42.jpeg',
    );

    expect(publicId).toBe('ssb/members/17-42');
    expect(url).toBe(
      `https://res.cloudinary.com/awan-uji/image/upload/f_auto,q_auto/${publicId}.jpeg`,
    );
  });
});
