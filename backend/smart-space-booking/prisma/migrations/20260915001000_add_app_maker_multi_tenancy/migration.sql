-- DropIndex
DROP INDEX `reservasi_kode_booking_key` ON `reservasi`;

-- DropIndex
DROP INDEX `users_username_key` ON `users`;

-- AlterTable
ALTER TABLE `diskon` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `member` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `reservasi` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `space` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `space_owner` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `id_maker` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `maker` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `app_key` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `maker_username_key`(`username`),
    UNIQUE INDEX `maker_email_key`(`email`),
    UNIQUE INDEX `maker_app_key_key`(`app_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `diskon_id_maker_idx` ON `diskon`(`id_maker`);

-- CreateIndex
CREATE INDEX `member_id_maker_idx` ON `member`(`id_maker`);

-- CreateIndex
CREATE UNIQUE INDEX `reservasi_id_maker_kode_booking_key` ON `reservasi`(`id_maker`, `kode_booking`);

-- CreateIndex
CREATE INDEX `space_id_maker_idx` ON `space`(`id_maker`);

-- CreateIndex
CREATE INDEX `space_owner_id_maker_idx` ON `space_owner`(`id_maker`);

-- CreateIndex
CREATE UNIQUE INDEX `users_id_maker_username_key` ON `users`(`id_maker`, `username`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space_owner` ADD CONSTRAINT `space_owner_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space` ADD CONSTRAINT `space_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diskon` ADD CONSTRAINT `diskon_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

