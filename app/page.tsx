'use client';

import { useState, useEffect } from 'react';
import * as actions from '@/lib/actions';

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pelanggan, setPelanggan] = useState<any[]>([]);
  const [layanan, setLayanan] = useState<any[]>([]);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [stok, setStok] = useState<any[]>([]);
  const [antar, setAntar] = useState<any[]>([]);
  const [laporan, setLaporan] = useState<any>(null);
  const [toasts, setToasts] = useState<any[]>([]);
  const [modals, setModals] = useState<any>({
    pelanggan: false,
    layanan: false,
    transaksi: false,
    stok: false,
    antar: false,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [searchTerms, setSearchTerms] = useState<any>({
    pelanggan: '',
    transaksi: '',
  });

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    loadData(activePage);
  }, [activePage]);

  const loadData = async (page: string) => {
    try {
      if (page === 'dashboard') {
        const data = await actions.getDashboardData();
        const trans = await actions.getTransaksi();
        setDashboardData({ ...data, recent: (trans as any[]).slice(0, 5) });
      } else if (page === 'pelanggan') {
        const data = await actions.getPelanggan();
        setPelanggan(data as any[]);
      } else if (page === 'layanan') {
        const data = await actions.getLayanan();
        setLayanan(data as any[]);
      } else if (page === 'transaksi') {
        const data = await actions.getTransaksi();
        setTransaksi(data as any[]);
        // Also need pelanggan and layanan for dropdowns
        const p = await actions.getPelanggan();
        const l = await actions.getLayanan();
        setPelanggan(p as any[]);
        setLayanan(l as any[]);
      } else if (page === 'stok') {
        const data = await actions.getStok();
        setStok(data as any[]);
      } else if (page === 'antar') {
        const data = await actions.getAntar();
        setAntar(data as any[]);
        const t = await actions.getTransaksi();
        setTransaksi(t as any[]);
      } else if (page === 'laporan') {
        const data = await actions.getLaporan();
        setLaporan(data);
      }
    } catch (error) {
      showToast('Gagal memuat data', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const openModal = (type: string, id: number | null = null) => {
    setEditingId(id);
    if (id) {
      let data;
      if (type === 'pelanggan') data = pelanggan.find((p) => p.id_pelanggan === id);
      if (type === 'layanan') data = layanan.find((l) => l.id_layanan === id);
      if (type === 'transaksi') data = transaksi.find((t) => t.id_transaksi === id);
      if (type === 'stok') data = stok.find((s) => s.id_barang === id);
      if (type === 'antar') data = antar.find((a) => a.id_antar_jemput === id);
      setFormData(data || {});
    } else {
      setFormData({});
    }
    setModals((prev: any) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: string) => {
    setModals((prev: any) => ({ ...prev, [type]: false }));
    setEditingId(null);
    setFormData({});
  };

  const handleSubmit = async (type: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (type === 'pelanggan') {
        if (editingId) await actions.updatePelanggan(editingId, formData);
        else await actions.addPelanggan(formData);
      } else if (type === 'layanan') {
        if (editingId) await actions.updateLayanan(editingId, formData);
        else await actions.addLayanan(formData);
      } else if (type === 'transaksi') {
        if (editingId) await actions.updateTransaksi(editingId, formData);
        else await actions.addTransaksi({ ...formData, tgl_masuk: new Date().toISOString().split('T')[0] });
      } else if (type === 'stok') {
        if (editingId) await actions.updateStok(editingId, formData);
        else await actions.addStok(formData);
      } else if (type === 'antar') {
        if (editingId) await actions.updateAntar(editingId, formData);
        else await actions.addAntar(formData);
      }
      showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil disimpan`);
      closeModal(type);
      loadData(activePage);
    } catch (error) {
      showToast('Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm(`Hapus data ini?`)) return;
    try {
      if (type === 'pelanggan') await actions.deletePelanggan(id);
      if (type === 'layanan') await actions.deleteLayanan(id);
      if (type === 'transaksi') await actions.deleteTransaksi(id);
      if (type === 'stok') await actions.deleteStok(id);
      if (type === 'antar') await actions.deleteAntar(id);
      showToast('Data berhasil dihapus');
      loadData(activePage);
    } catch (error) {
      showToast('Gagal menghapus data', 'error');
    }
  };

  const filteredPelanggan = pelanggan.filter((p) => 
    Object.values(p).some((val) => String(val).toLowerCase().includes(searchTerms.pelanggan.toLowerCase()))
  );

  const filteredTransaksi = transaksi.filter((t) => 
    Object.values(t).some((val) => String(val).toLowerCase().includes(searchTerms.transaksi.toLowerCase()))
  );

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <i className="fas fa-soap"></i>
          <span>CleanCloud</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
              <i className="fas fa-chart-line"></i> Dashboard
            </li>
            <li className={activePage === 'pelanggan' ? 'active' : ''} onClick={() => setActivePage('pelanggan')}>
              <i className="fas fa-users"></i> Pelanggan
            </li>
            <li className={activePage === 'layanan' ? 'active' : ''} onClick={() => setActivePage('layanan')}>
              <i className="fas fa-concierge-bell"></i> Layanan
            </li>
            <li className={activePage === 'transaksi' ? 'active' : ''} onClick={() => setActivePage('transaksi')}>
              <i className="fas fa-exchange-alt"></i> Transaksi
            </li>
            <li className={activePage === 'stok' ? 'active' : ''} onClick={() => setActivePage('stok')}>
              <i className="fas fa-boxes-stacked"></i> Stok Barang
            </li>
            <li className={activePage === 'antar' ? 'active' : ''} onClick={() => setActivePage('antar')}>
              <i className="fas fa-truck"></i> Antar Jemput
            </li>
            <li className={activePage === 'laporan' ? 'active' : ''} onClick={() => setActivePage('laporan')}>
              <i className="fas fa-file-invoice-dollar"></i> Laporan
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>&copy; 2026 CleanCloud</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="top-bar">
          <div className="user-info">
            <span>{currentDate}</span>
          </div>
        </header>

        <div className="content-area">
          {/* DASHBOARD */}
          {activePage === 'dashboard' && (
            <section id="dashboard" className="page">
              <div className="page-header">
                <h1>Dashboard</h1>
                <p>Ringkasan operasional hari ini</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Total Pelanggan</h3>
                    <p>{dashboardData?.totalPelanggan || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <i className="fas fa-receipt"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Total Transaksi</h3>
                    <p>{dashboardData?.totalTransaksi || 0}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="stat-info">
                    <h3>Pendapatan</h3>
                    <p>Rp {(dashboardData?.pendapatan || 0).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              <div className="recent-activity card">
                <div className="card-header flex justify-between items-center mb-4">
                  <h3 className="font-bold">Transaksi Terakhir</h3>
                  <button className="btn-sm btn-outline" onClick={() => setActivePage('transaksi')}>Lihat Semua</button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Pelanggan</th>
                        <th>Layanan</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.recent?.map((item: any, idx: number) => (
                        <tr key={`recent-${item.id_transaksi}-${idx}`}>
                          <td>{item.nama}</td>
                          <td>{item.jenis_layanan}</td>
                          <td>Rp {item.total.toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`status ${item.status_pembayaran === 'Lunas' ? 'lunas' : 'belum'}`}>
                              {item.status_pembayaran}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* PELANGGAN */}
          {activePage === 'pelanggan' && (
            <section id="pelanggan" className="page">
              <div className="page-header">
                <h1>Data Pelanggan</h1>
                <button className="btn-primary" onClick={() => openModal('pelanggan')}>
                  <i className="fas fa-plus"></i> Tambah Pelanggan
                </button>
              </div>

              <div className="card">
                <div className="card-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder="Cari pelanggan..." 
                      value={searchTerms.pelanggan}
                      onChange={(e) => setSearchTerms({...searchTerms, pelanggan: e.target.value})}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama</th>
                        <th>Alamat</th>
                        <th>Telepon</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPelanggan.map((item: any, idx: number) => (
                        <tr key={`p-${item.id_pelanggan}-${idx}`}>
                          <td>{item.id_pelanggan}</td>
                          <td>{item.nama}</td>
                          <td>{item.alamat}</td>
                          <td>{item.telepon}</td>
                          <td>
                            <button className="btn-icon btn-outline mr-2" onClick={() => openModal('pelanggan', item.id_pelanggan)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon btn-danger" onClick={() => handleDelete('pelanggan', item.id_pelanggan)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* LAYANAN */}
          {activePage === 'layanan' && (
            <section id="layanan" className="page">
              <div className="page-header">
                <h1>Data Layanan</h1>
                <button className="btn-primary" onClick={() => openModal('layanan')}>
                  <i className="fas fa-plus"></i> Tambah Layanan
                </button>
              </div>

              <div className="card">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Jenis Layanan</th>
                        <th>Harga / KG</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layanan.map((item: any, idx: number) => (
                        <tr key={`l-${item.id_layanan}-${idx}`}>
                          <td>{item.id_layanan}</td>
                          <td>{item.jenis_layanan}</td>
                          <td>Rp {item.harga_per_kg.toLocaleString('id-ID')}</td>
                          <td>
                            <button className="btn-icon btn-outline mr-2" onClick={() => openModal('layanan', item.id_layanan)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon btn-danger" onClick={() => handleDelete('layanan', item.id_layanan)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TRANSAKSI */}
          {activePage === 'transaksi' && (
            <section id="transaksi" className="page">
              <div className="page-header">
                <h1>Data Transaksi</h1>
                <button className="btn-primary" onClick={() => openModal('transaksi')}>
                  <i className="fas fa-plus"></i> Transaksi Baru
                </button>
              </div>

              <div className="card">
                <div className="card-filters">
                  <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input 
                      type="text" 
                      placeholder="Cari transaksi..." 
                      value={searchTerms.transaksi}
                      onChange={(e) => setSearchTerms({...searchTerms, transaksi: e.target.value})}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Pelanggan</th>
                        <th>Layanan</th>
                        <th>Berat</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Tanggal</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransaksi.map((item: any, idx: number) => (
                        <tr key={`t-${item.id_transaksi}-${idx}`}>
                          <td>#{item.id_transaksi}</td>
                          <td><strong>{item.nama}</strong></td>
                          <td>{item.jenis_layanan}</td>
                          <td>{item.berat} KG</td>
                          <td>Rp {item.total.toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`status ${item.status_pembayaran === 'Lunas' ? 'lunas' : 'belum'}`}>
                              {item.status_pembayaran}
                            </span>
                          </td>
                          <td>{new Date(item.tgl_masuk).toLocaleDateString('id-ID')}</td>
                          <td>
                            <button className="btn-icon btn-outline mr-2" onClick={() => openModal('transaksi', item.id_transaksi)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon btn-danger" onClick={() => handleDelete('transaksi', item.id_transaksi)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* STOK */}
          {activePage === 'stok' && (
            <section id="stok" className="page">
              <div className="page-header">
                <h1>Stok Barang</h1>
                <button className="btn-primary" onClick={() => openModal('stok')}>
                  <i className="fas fa-plus"></i> Tambah Stok
                </button>
              </div>

              <div className="card">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nama Barang</th>
                        <th>Jumlah</th>
                        <th>Satuan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stok.map((item: any, idx: number) => (
                        <tr key={`s-${item.id_barang}-${idx}`}>
                          <td>{item.id_barang}</td>
                          <td>{item.nama_barang}</td>
                          <td>{item.jumlah}</td>
                          <td>{item.satuan}</td>
                          <td>
                            <button className="btn-icon btn-outline mr-2" onClick={() => openModal('stok', item.id_barang)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon btn-danger" onClick={() => handleDelete('stok', item.id_barang)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ANTAR */}
          {activePage === 'antar' && (
            <section id="antar" className="page">
              <div className="page-header">
                <h1>Antar Jemput</h1>
                <button className="btn-primary" onClick={() => openModal('antar')}>
                  <i className="fas fa-plus"></i> Tambah Antar
                </button>
              </div>

              <div className="card">
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>ID Transaksi</th>
                        <th>Alamat Tujuan</th>
                        <th>Biaya Antar</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {antar.map((item: any, idx: number) => (
                        <tr key={`a-${item.id_antar_jemput}-${idx}`}>
                          <td>{item.id_antar_jemput}</td>
                          <td>#{item.id_transaksi}</td>
                          <td>{item.alamat_tujuan}</td>
                          <td>Rp {item.biaya_antar.toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`status ${item.status_antar.toLowerCase()}`}>
                              {item.status_antar}
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon btn-outline mr-2" onClick={() => openModal('antar', item.id_antar_jemput)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="btn-icon btn-danger" onClick={() => handleDelete('antar', item.id_antar_jemput)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* LAPORAN */}
          {activePage === 'laporan' && (
            <section id="laporan" className="page">
              <div className="page-header">
                <h1>Laporan Keuangan</h1>
                <button className="btn-secondary" onClick={() => window.print()}>
                  <i className="fas fa-print"></i> Cetak Laporan
                </button>
              </div>

              <div className="laporan-summary">
                <div className="card text-center py-10">
                  <h3 className="text-xl mb-4">Total Pendapatan Akumulasi</h3>
                  <h2 className="text-4xl font-bold text-primary">Rp {(laporan?.total || 0).toLocaleString('id-ID')}</h2>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODALS */}
      {/* Modal Pelanggan */}
      <div className={`modal ${modals.pelanggan ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
            <span className="close" onClick={() => closeModal('pelanggan')}>&times;</span>
          </div>
          <form onSubmit={(e) => handleSubmit('pelanggan', e)}>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                required 
                value={formData.nama || ''} 
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Alamat</label>
              <input 
                type="text" 
                required 
                value={formData.alamat || ''} 
                onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Nomor Telepon</label>
              <input 
                type="text" 
                required 
                value={formData.telepon || ''} 
                onChange={(e) => setFormData({...formData, telepon: e.target.value})}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => closeModal('pelanggan')}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Layanan */}
      <div className={`modal ${modals.layanan ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editingId ? 'Edit Layanan' : 'Tambah Layanan'}</h2>
            <span className="close" onClick={() => closeModal('layanan')}>&times;</span>
          </div>
          <form onSubmit={(e) => handleSubmit('layanan', e)}>
            <div className="form-group">
              <label>Jenis Layanan</label>
              <input 
                type="text" 
                required 
                value={formData.jenis_layanan || ''} 
                onChange={(e) => setFormData({...formData, jenis_layanan: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Harga per KG</label>
              <input 
                type="number" 
                required 
                value={formData.harga_per_kg || ''} 
                onChange={(e) => setFormData({...formData, harga_per_kg: e.target.value})}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => closeModal('layanan')}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Transaksi */}
      <div className={`modal ${modals.transaksi ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editingId ? 'Edit Transaksi' : 'Transaksi Baru'}</h2>
            <span className="close" onClick={() => closeModal('transaksi')}>&times;</span>
          </div>
          <form onSubmit={(e) => handleSubmit('transaksi', e)}>
            <div className="form-group">
              <label>Pelanggan</label>
              <select 
                required 
                value={formData.id_pelanggan || ''} 
                onChange={(e) => setFormData({...formData, id_pelanggan: e.target.value})}
              >
                <option value="">-- Pilih Pelanggan --</option>
                {pelanggan.map((p, idx) => (
                  <option key={`p-${p.id_pelanggan || idx}`} value={p.id_pelanggan}>{p.nama}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Layanan</label>
              <select 
                required 
                value={formData.id_layanan || ''} 
                onChange={(e) => setFormData({...formData, id_layanan: e.target.value})}
              >
                <option value="">-- Pilih Layanan --</option>
                {layanan.map((l, idx) => (
                  <option key={`l-${l.id_layanan || idx}`} value={l.id_layanan}>{l.jenis_layanan} (Rp {l.harga_per_kg.toLocaleString('id-ID')})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Berat (KG)</label>
              <input 
                type="number" 
                step="0.1" 
                required 
                value={formData.berat || ''} 
                onChange={(e) => setFormData({...formData, berat: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Status Pembayaran</label>
              <select 
                value={formData.status_pembayaran || 'Belum Lunas'} 
                onChange={(e) => setFormData({...formData, status_pembayaran: e.target.value})}
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => closeModal('transaksi')}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Stok */}
      <div className={`modal ${modals.stok ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editingId ? 'Edit Stok' : 'Tambah Stok'}</h2>
            <span className="close" onClick={() => closeModal('stok')}>&times;</span>
          </div>
          <form onSubmit={(e) => handleSubmit('stok', e)}>
            <div className="form-group">
              <label>Nama Barang</label>
              <input 
                type="text" 
                required 
                value={formData.nama_barang || ''} 
                onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Jumlah</label>
              <input 
                type="number" 
                required 
                value={formData.jumlah || ''} 
                onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Satuan</label>
              <input 
                type="text" 
                required 
                value={formData.satuan || ''} 
                onChange={(e) => setFormData({...formData, satuan: e.target.value})}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => closeModal('stok')}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal Antar */}
      <div className={`modal ${modals.antar ? 'active' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editingId ? 'Edit Antar Jemput' : 'Tambah Antar Jemput'}</h2>
            <span className="close" onClick={() => closeModal('antar')}>&times;</span>
          </div>
          <form onSubmit={(e) => handleSubmit('antar', e)}>
            <div className="form-group">
              <label>ID Transaksi</label>
              <select 
                required 
                value={formData.id_transaksi || ''} 
                onChange={(e) => setFormData({...formData, id_transaksi: e.target.value})}
                disabled={!!editingId}
              >
                <option value="">-- Pilih Transaksi --</option>
                {transaksi.map((t, idx) => (
                  <option key={`t-${t.id_transaksi || idx}`} value={t.id_transaksi}>#{t.id_transaksi} - {t.nama}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Alamat Tujuan</label>
              <input 
                type="text" 
                required 
                value={formData.alamat_tujuan || ''} 
                onChange={(e) => setFormData({...formData, alamat_tujuan: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Biaya Antar</label>
              <input 
                type="number" 
                required 
                value={formData.biaya_antar || ''} 
                onChange={(e) => setFormData({...formData, biaya_antar: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status_antar || 'Proses'} 
                onChange={(e) => setFormData({...formData, status_antar: e.target.value})}
              >
                <option value="Proses">Proses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={() => closeModal('antar')}>Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <div className="toast-container">
        {toasts.map((toast, idx) => (
          <div key={`${toast.id}-${idx}`} className={`toast ${toast.type}`}>
            <i className={`fas ${toast.type === 'error' ? 'fa-exclamation-circle' : toast.type === 'info' ? 'fa-info-circle' : 'fa-check-circle'}`}></i>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
