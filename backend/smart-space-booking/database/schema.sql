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

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin_space', 'member') NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_id_maker_username_key`(`id_maker`, `username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_member` VARCHAR(100) NOT NULL,
    `instansi` VARCHAR(100) NOT NULL,
    `alamat` TEXT NOT NULL,
    `telp` VARCHAR(20) NOT NULL,
    `foto` VARCHAR(255) NULL,
    `id_user` INTEGER NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `member_id_user_key`(`id_user`),
    INDEX `member_deleted_at_idx`(`deleted_at`),
    INDEX `member_id_maker_idx`(`id_maker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `space_owner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_coworking` VARCHAR(100) NOT NULL,
    `nama_pemilik` VARCHAR(100) NOT NULL,
    `telp` VARCHAR(20) NOT NULL,
    `alamat` TEXT NULL,
    `deskripsi` TEXT NULL,
    `foto` VARCHAR(255) NULL,
    `id_user` INTEGER NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `space_owner_id_user_key`(`id_user`),
    INDEX `space_owner_id_maker_idx`(`id_maker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `space` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_space` VARCHAR(100) NOT NULL,
    `harga_per_jam` INTEGER NOT NULL,
    `tipe` ENUM('desk', 'meeting_room', 'private_office') NOT NULL,
    `kapasitas` INTEGER NOT NULL,
    `foto` VARCHAR(255) NULL,
    `deskripsi` TEXT NOT NULL,
    `id_owner` INTEGER NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `space_id_owner_idx`(`id_owner`),
    INDEX `space_tipe_idx`(`tipe`),
    INDEX `space_deleted_at_idx`(`deleted_at`),
    INDEX `space_id_maker_idx`(`id_maker`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diskon` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_diskon` VARCHAR(100) NOT NULL,
    `persentase_diskon` INTEGER NOT NULL,
    `tanggal_awal` DATETIME(3) NOT NULL,
    `tanggal_akhir` DATETIME(3) NOT NULL,
    `id_owner` INTEGER NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    INDEX `diskon_tanggal_awal_tanggal_akhir_idx`(`tanggal_awal`, `tanggal_akhir`),
    INDEX `diskon_id_maker_idx`(`id_maker`),
    UNIQUE INDEX `diskon_id_owner_nama_diskon_key`(`id_owner`, `nama_diskon`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode_booking` VARCHAR(30) NOT NULL,
    `tanggal_reservasi` DATE NOT NULL,
    `jam_mulai` VARCHAR(5) NOT NULL,
    `jam_selesai` VARCHAR(5) NOT NULL,
    `durasi_jam` INTEGER NOT NULL,
    `id_owner` INTEGER NOT NULL,
    `id_member` INTEGER NOT NULL,
    `id_maker` INTEGER NOT NULL,
    `status` ENUM('belum_dikonfirm', 'disetujui', 'aktif', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'belum_dikonfirm',
    `check_in_time` DATETIME(3) NULL,
    `check_out_time` DATETIME(3) NULL,
    `catatan_batal` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reservasi_tanggal_reservasi_status_idx`(`tanggal_reservasi`, `status`),
    INDEX `reservasi_id_owner_tanggal_reservasi_idx`(`id_owner`, `tanggal_reservasi`),
    INDEX `reservasi_id_member_idx`(`id_member`),
    UNIQUE INDEX `reservasi_id_maker_kode_booking_key`(`id_maker`, `kode_booking`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_reservasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_reservasi` INTEGER NOT NULL,
    `id_space` INTEGER NOT NULL,
    `id_diskon` INTEGER NULL,
    `harga_per_jam` INTEGER NOT NULL,
    `total_harga_awal` INTEGER NOT NULL,
    `persentase_diskon` INTEGER NOT NULL DEFAULT 0,
    `potongan_diskon` INTEGER NOT NULL DEFAULT 0,
    `total_harga` INTEGER NOT NULL,

    UNIQUE INDEX `detail_reservasi_id_reservasi_key`(`id_reservasi`),
    INDEX `detail_reservasi_id_space_idx`(`id_space`),
    INDEX `detail_reservasi_id_diskon_idx`(`id_diskon`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member` ADD CONSTRAINT `member_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space_owner` ADD CONSTRAINT `space_owner_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space_owner` ADD CONSTRAINT `space_owner_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space` ADD CONSTRAINT `space_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `space` ADD CONSTRAINT `space_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diskon` ADD CONSTRAINT `diskon_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diskon` ADD CONSTRAINT `diskon_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_owner_fkey` FOREIGN KEY (`id_owner`) REFERENCES `space_owner`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_member_fkey` FOREIGN KEY (`id_member`) REFERENCES `member`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_id_maker_fkey` FOREIGN KEY (`id_maker`) REFERENCES `maker`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_reservasi_fkey` FOREIGN KEY (`id_reservasi`) REFERENCES `reservasi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_space_fkey` FOREIGN KEY (`id_space`) REFERENCES `space`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_reservasi` ADD CONSTRAINT `detail_reservasi_id_diskon_fkey` FOREIGN KEY (`id_diskon`) REFERENCES `diskon`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

