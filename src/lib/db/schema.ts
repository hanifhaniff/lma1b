import { mysqlTable, varchar, text, timestamp, int, datetime, date, decimal, index } from 'drizzle-orm/mysql-core';

// Users table for authentication
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// IT Assets table (matching PostgreSQL schema)
export const itAssets = mysqlTable('it_assets', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  nama: varchar('nama', { length: 255 }).notNull(),
  pic: varchar('pic', { length: 255 }).notNull(),
  serialNumber: varchar('serial_number', { length: 255 }).notNull(),
  tanggalDiterima: date('tanggal_diterima').notNull(),
  kategori: varchar('kategori', { length: 100 }).notNull(),
  nomorAsset: varchar('nomor_asset', { length: 255 }).notNull().unique(),
  nomorBast: varchar('nomor_bast', { length: 255 }),
  keterangan: text('keterangan'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  nomorAssetIdx: index('idx_it_assets_nomor_asset').on(table.nomorAsset),
  kategoriIdx: index('idx_it_assets_kategori').on(table.kategori),
  picIdx: index('idx_it_assets_pic').on(table.pic),
  serialNumberIdx: index('idx_it_assets_serial_number').on(table.serialNumber),
}));

// Starlink Usage table (matching PostgreSQL schema)
export const starlinkUsage = mysqlTable('starlink_usage', {
  id: int('id').primaryKey().autoincrement(),
  tanggal: date('tanggal').notNull(),
  unitStarlink: varchar('unit_starlink', { length: 255 }).notNull(),
  totalPemakaian: decimal('total_pemakaian', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  tanggalIdx: index('idx_starlink_usage_tanggal').on(table.tanggal),
  unitIdx: index('idx_starlink_usage_unit').on(table.unitStarlink),
  createdAtIdx: index('idx_starlink_usage_created_at').on(table.createdAt),
}));
