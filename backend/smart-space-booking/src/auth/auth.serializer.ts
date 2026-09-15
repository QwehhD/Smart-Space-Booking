import { Member, SpaceOwner } from '@prisma/client';
import { buildFotoUrl } from '../common/utils/foto.util';

export const serializeMember = (member: Member, appUrl: string) => ({
  id: member.id,
  nama_member: member.nama_member,
  instansi: member.instansi,
  alamat: member.alamat,
  telp: member.telp,
  foto: member.foto,
  foto_url: buildFotoUrl(appUrl, 'members', member.foto),
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
