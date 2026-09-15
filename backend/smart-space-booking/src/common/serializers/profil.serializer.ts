/**
 * Bentuk profil member dan pemilik space yang dikembalikan ke klien. Dipakai
 * bersama oleh modul auth dan admin agar satu profil tidak pernah tampil dengan
 * bentuk yang berbeda-beda antar endpoint.
 */
import { Member, SpaceOwner } from '@prisma/client';
import { buildFotoUrl } from '../utils/foto.util';

export const serializeMember = (member: Member, appUrl: string) => ({
  id: member.id,
  nama_member: member.nama_member,
  instansi: member.instansi,
  alamat: member.alamat,
  telp: member.telp,
  foto: member.foto,
  foto_url: buildFotoUrl(appUrl, 'members', member.foto),
  // Disertakan karena daftar member pada panel admin membutuhkannya, dan satu
  // bentuk yang sama memudahkan frontend memakai ulang komponen profil.
  created_at: member.created_at,
});

export const serializeSpaceOwner = (owner: SpaceOwner, appUrl: string) => ({
  id: owner.id,
  nama_coworking: owner.nama_coworking,
  nama_pemilik: owner.nama_pemilik,
  telp: owner.telp,
  alamat: owner.alamat,
  deskripsi: owner.deskripsi,
  foto: owner.foto,
  foto_url: buildFotoUrl(appUrl, 'general', owner.foto),
});
