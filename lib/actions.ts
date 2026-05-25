'use server'

import db from './db';
import { revalidatePath } from 'next/cache';

// ==================== DASHBOARD ====================
export async function getDashboardData() {
  const [rows]: any = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM pelanggan) AS totalPelanggan,
      (SELECT COUNT(*) FROM transaksi) AS totalTransaksi,
      (
        SELECT IFNULL(
          SUM(
            (t.berat * l.harga_per_kg)
            + IFNULL(aj.biaya_antar,0)
          ),
          0
        )
        FROM transaksi t
        JOIN layanan l ON t.id_layanan = l.id_layanan
        LEFT JOIN antar_jemput aj ON t.id_transaksi = aj.id_transaksi
      ) AS pendapatan
  `);
  return rows[0];
}

// ==================== PELANGGAN ====================
export async function getPelanggan() {
  const [rows] = await db.query('SELECT * FROM pelanggan');
  return rows;
}

export async function addPelanggan(data: { nama: string, alamat: string, telepon: string }) {
  await db.query('INSERT INTO pelanggan (nama, alamat, telepon) VALUES (?, ?, ?)', 
    [data.nama, data.alamat, data.telepon]);
  revalidatePath('/');
}

export async function updatePelanggan(id: number, data: { nama: string, alamat: string, telepon: string }) {
  await db.query('UPDATE pelanggan SET nama = ?, alamat = ?, telepon = ? WHERE id_pelanggan = ?', 
    [data.nama, data.alamat, data.telepon, id]);
  revalidatePath('/');
}

export async function deletePelanggan(id: number) {
  await db.query('DELETE FROM pelanggan WHERE id_pelanggan = ?', [id]);
  revalidatePath('/');
}

// ==================== LAYANAN ====================
export async function getLayanan() {
  const [rows] = await db.query('SELECT * FROM layanan');
  return rows;
}

export async function addLayanan(data: { jenis_layanan: string, harga_per_kg: number }) {
  await db.query('INSERT INTO layanan (jenis_layanan, harga_per_kg) VALUES (?, ?)', 
    [data.jenis_layanan, data.harga_per_kg]);
  revalidatePath('/');
}

export async function updateLayanan(id: number, data: { jenis_layanan: string, harga_per_kg: number }) {
  await db.query('UPDATE layanan SET jenis_layanan = ?, harga_per_kg = ? WHERE id_layanan = ?', 
    [data.jenis_layanan, data.harga_per_kg, id]);
  revalidatePath('/');
}

export async function deleteLayanan(id: number) {
  await db.query('DELETE FROM layanan WHERE id_layanan = ?', [id]);
  revalidatePath('/');
}

// ==================== TRANSAKSI ====================
export async function getTransaksi() {
  const [rows] = await db.query(`
    SELECT
      t.id_transaksi,
      p.nama,
      p.id_pelanggan,
      l.jenis_layanan,
      l.id_layanan,
      t.berat,
      ((t.berat * l.harga_per_kg) + IFNULL(aj.biaya_antar,0)) AS total,
      t.status_pembayaran,
      t.tgl_masuk
    FROM transaksi t
    JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
    JOIN layanan l ON t.id_layanan = l.id_layanan
    LEFT JOIN antar_jemput aj ON t.id_transaksi = aj.id_transaksi
  `);
  return rows;
}

export async function addTransaksi(data: { id_pelanggan: number, id_layanan: number, berat: number, status_pembayaran: string, tgl_masuk: string }) {
  await db.query('INSERT INTO transaksi (id_pelanggan, id_layanan, berat, status_pembayaran, tgl_masuk) VALUES (?, ?, ?, ?, ?)', 
    [data.id_pelanggan, data.id_layanan, data.berat, data.status_pembayaran, data.tgl_masuk]);
  revalidatePath('/');
}

export async function updateTransaksi(id: number, data: { id_pelanggan: number, id_layanan: number, berat: number, status_pembayaran: string }) {
  await db.query('UPDATE transaksi SET id_pelanggan = ?, id_layanan = ?, berat = ?, status_pembayaran = ? WHERE id_transaksi = ?', 
    [data.id_pelanggan, data.id_layanan, data.berat, data.status_pembayaran, id]);
  revalidatePath('/');
}

export async function deleteTransaksi(id: number) {
  await db.query('DELETE FROM transaksi WHERE id_transaksi = ?', [id]);
  revalidatePath('/');
}

// ==================== STOK ====================
export async function getStok() {
  const [rows] = await db.query('SELECT * FROM stok_barang');
  return rows;
}

export async function addStok(data: { nama_barang: string, jumlah: number, satuan: string }) {
  await db.query('INSERT INTO stok_barang (nama_barang, jumlah, satuan) VALUES (?, ?, ?)', 
    [data.nama_barang, data.jumlah, data.satuan]);
  revalidatePath('/');
}

export async function updateStok(id: number, data: { nama_barang: string, jumlah: number, satuan: string }) {
  await db.query('UPDATE stok_barang SET nama_barang = ?, jumlah = ?, satuan = ? WHERE id_barang = ?', 
    [data.nama_barang, data.jumlah, data.satuan, id]);
  revalidatePath('/');
}

export async function deleteStok(id: number) {
  await db.query('DELETE FROM stok_barang WHERE id_barang = ?', [id]);
  revalidatePath('/');
}

// ==================== ANTAR JEMPUT ====================
export async function getAntar() {
  const [rows] = await db.query('SELECT * FROM antar_jemput');
  return rows;
}

export async function addAntar(data: { id_transaksi: number, alamat_tujuan: string, biaya_antar: number, status_antar: string }) {
  await db.query('INSERT INTO antar_jemput (id_transaksi, alamat_tujuan, biaya_antar, status_antar) VALUES (?, ?, ?, ?)', 
    [data.id_transaksi, data.alamat_tujuan, data.biaya_antar, data.status_antar]);
  revalidatePath('/');
}

export async function updateAntar(id: number, data: { alamat_tujuan: string, biaya_antar: number, status_antar: string }) {
  await db.query('UPDATE antar_jemput SET alamat_tujuan = ?, biaya_antar = ?, status_antar = ? WHERE id_antar_jemput = ?', 
    [data.alamat_tujuan, data.biaya_antar, data.status_antar, id]);
  revalidatePath('/');
}

export async function deleteAntar(id: number) {
  await db.query('DELETE FROM antar_jemput WHERE id_antar_jemput = ?', [id]);
  revalidatePath('/');
}

// ==================== LAPORAN ====================
export async function getLaporan() {
  const [rows]: any = await db.query(`
    SELECT IFNULL(SUM((t.berat * l.harga_per_kg) + IFNULL(aj.biaya_antar,0)), 0) AS total
    FROM transaksi t
    JOIN layanan l ON t.id_layanan = l.id_layanan
    LEFT JOIN antar_jemput aj ON t.id_transaksi = aj.id_transaksi
  `);
  return rows[0];
}
