-- DropForeignKey
ALTER TABLE `diskon` DROP FOREIGN KEY `diskon_id_maker_fkey`;

-- DropForeignKey
ALTER TABLE `member` DROP FOREIGN KEY `member_id_maker_fkey`;

-- DropForeignKey
ALTER TABLE `reservasi` DROP FOREIGN KEY `reservasi_id_maker_fkey`;

-- DropForeignKey
ALTER TABLE `space` DROP FOREIGN KEY `space_id_maker_fkey`;

-- DropForeignKey
ALTER TABLE `space_owner` DROP FOREIGN KEY `space_owner_id_maker_fkey`;

-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_id_maker_fkey`;

-- DropIndex
DROP INDEX `diskon_id_maker_idx` ON `diskon`;

-- DropIndex
DROP INDEX `member_id_maker_idx` ON `member`;

-- DropIndex
DROP INDEX `reservasi_id_maker_kode_booking_key` ON `reservasi`;

-- DropIndex
DROP INDEX `space_id_maker_idx` ON `space`;

-- DropIndex
DROP INDEX `space_owner_id_maker_idx` ON `space_owner`;

-- DropIndex
DROP INDEX `users_id_maker_username_key` ON `users`;

-- AlterTable
ALTER TABLE `diskon` DROP COLUMN `id_maker`;

-- AlterTable
ALTER TABLE `member` DROP COLUMN `id_maker`;

-- AlterTable
ALTER TABLE `reservasi` DROP COLUMN `id_maker`;

-- AlterTable
ALTER TABLE `space` DROP COLUMN `id_maker`;

-- AlterTable
ALTER TABLE `space_owner` DROP COLUMN `id_maker`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `id_maker`;

-- DropTable
DROP TABLE `maker`;

-- CreateIndex
CREATE UNIQUE INDEX `reservasi_kode_booking_key` ON `reservasi`(`kode_booking`);

-- CreateIndex
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

