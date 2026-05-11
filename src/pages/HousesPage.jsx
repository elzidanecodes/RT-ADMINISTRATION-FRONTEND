import { useEffect, useState } from 'react';
import * as houseApi from '../api/houseApi';
import * as residentApi from '../api/residentApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatDate } from '../utils/format';

// ─── Form Modal ────────────────────────────────────────────────────────────────
function HouseFormModal({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState({
    house_number: '', block: '', address: '',
    ownership_type: 'permanent', status: 'vacant', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial
      ? { house_number: initial.house_number ?? '', block: initial.block ?? '', address: initial.address ?? '', ownership_type: initial.ownership_type ?? 'permanent', status: initial.status ?? 'vacant', notes: initial.notes ?? '' }
      : { house_number: '', block: '', address: '', ownership_type: 'permanent', status: 'vacant', notes: '' }
    );
    setErrors({});
  }, [initial, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      initial?.id ? await houseApi.updateHouse(initial.id, form) : await houseApi.createHouse(form);
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Rumah' : 'Tambah Rumah'}>
      <form onSubmit={handleSubmit} className="space-y-md">
        <div className="grid grid-cols-2 gap-md">
          <Input label="Nomor Rumah" value={form.house_number} onChange={set('house_number')} error={errors.house_number?.[0]} required />
          <Input label="Blok" value={form.block} onChange={set('block')} error={errors.block?.[0]} placeholder="Opsional" />
        </div>
        <Input label="Alamat" value={form.address} onChange={set('address')} error={errors.address?.[0]} placeholder="Opsional" />
        <div className="grid grid-cols-2 gap-md">
          <Select label="Tipe Kepemilikan" value={form.ownership_type} onChange={set('ownership_type')}>
            <option value="permanent">Milik Sendiri</option>
            <option value="rental">Sewa</option>
          </Select>
          <Select label="Status" value={form.status} onChange={set('status')}>
            <option value="vacant">Kosong</option>
            <option value="occupied">Dihuni</option>
          </Select>
        </div>
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">Catatan</label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={2}
            placeholder="Opsional"
            className="input-dark w-full px-md py-sm text-body-sm resize-none"
          />
        </div>
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Assign Modal ──────────────────────────────────────────────────────────────
function AssignModal({ open, onClose, house, onSaved }) {
  const [residents, setResidents] = useState([]);
  const [residentId, setResidentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    residentApi.getResidents({ per_page: 100, status: 'active' })
      .then((res) => setResidents(res.data.data ?? []));
    setResidentId(''); setStartDate(''); setNotes(''); setError('');
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await houseApi.assignResident(house.id, { resident_id: residentId, start_date: startDate, notes });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal menetapkan warga.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Tetapkan Penghuni — Rumah ${house?.house_number}`}>
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}
        <Select label="Pilih Warga" value={residentId} onChange={(e) => setResidentId(e.target.value)} required>
          <option value="">-- Pilih Warga --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>{r.full_name} — {r.nik}</option>
          ))}
        </Select>
        <Input label="Tanggal Mulai Tinggal" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Opsional"
            className="input-dark w-full px-md py-sm text-body-sm resize-none"
          />
        </div>
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Tetapkan</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Unassign Modal ────────────────────────────────────────────────────────────
function UnassignModal({ open, onClose, house, resident, onSaved }) {
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setEndDate(''); setError(''); }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await houseApi.unassignResident(house.id, { resident_id: resident.id, end_date: endDate });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal mencabut penghuni.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cabut Penghuni">
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}
        <div className="bg-surface-container rounded-xl px-md py-sm flex items-center gap-md">
          <span className="material-symbols-outlined text-on-surface-variant text-2xl">person_remove</span>
          <div>
            <p className="text-body-sm font-medium text-on-surface">{resident?.full_name}</p>
            <p className="text-[11px] text-on-surface-variant">akan dikeluarkan dari Rumah {house?.house_number}</p>
          </div>
        </div>
        <Input label="Tanggal Keluar" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button variant="danger" type="submit" loading={loading}>Cabut Penghuni</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────
function HouseDetailModal({ open, onClose, houseId, onEdit, onAssign, onUnassign }) {
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !houseId) return;
    setHouse(null);
    setLoading(true);
    houseApi.getHouse(houseId)
      .then((res) => setHouse(res.data.data))
      .finally(() => setLoading(false));
  }, [open, houseId]);

  const active = house?.active_resident ?? null;
  const history = house?.resident_history?.filter((r) => !r.is_active) ?? [];
  const bills = house?.bills_summary ?? { total_bills: 0, paid: 0, unpaid: 0, partial: 0 };

  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-2xl" hideTitle>
      {loading || !house ? (
        <div className="flex items-center justify-center py-xl gap-md">
          <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
          <p className="text-body-sm text-on-surface-variant">Memuat detail rumah...</p>
        </div>
      ) : (
        <div className="space-y-lg">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-md">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">home</span>
              </div>
              <div>
                <div className="flex items-center gap-sm mb-xs">
                  <h2 className="font-headline-md text-on-surface">Rumah {house.house_number}</h2>
                  {house.block && (
                    <span className="font-label-caps text-[10px] bg-surface-container-high text-on-surface-variant px-sm py-0.5 rounded-full uppercase">
                      Blok {house.block}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-sm">
                  <Badge value={house.status} />
                  <Badge value={house.ownership_type} />
                </div>
              </div>
            </div>
            <button
              onClick={() => { onClose(); onEdit(house); }}
              className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors text-body-sm"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              <span>Edit</span>
            </button>
          </div>

          {/* Address + Notes */}
          {(house.address || house.notes) && (
            <div className="bg-surface-container-low rounded-xl px-md py-sm space-y-xs">
              {house.address && (
                <div className="flex items-start gap-sm text-body-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">location_on</span>
                  <span className="text-on-surface-variant">{house.address}</span>
                </div>
              )}
              {house.notes && (
                <div className="flex items-start gap-sm text-body-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-base mt-0.5">notes</span>
                  <span className="text-on-surface-variant">{house.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Bills Summary */}
          <div className="grid grid-cols-4 gap-sm">
            {[
              { label: 'Total Tagihan', value: bills.total_bills, color: 'text-on-surface', bg: 'bg-surface-container' },
              { label: 'Lunas', value: bills.paid, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Belum Bayar', value: bills.unpaid, color: 'text-error', bg: 'bg-error/5' },
              { label: 'Sebagian', value: bills.partial, color: 'text-tertiary', bg: 'bg-tertiary/5' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl px-md py-sm text-center`}>
                <p className={`font-mono-data text-xl font-bold ${color}`}>{value}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Active Resident */}
          <div>
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Penghuni Aktif</h3>
              {!active && (
                <button
                  onClick={() => { onClose(); onAssign(house); }}
                  className="flex items-center gap-xs text-primary hover:opacity-80 transition-opacity text-body-sm font-medium"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Tetapkan
                </button>
              )}
            </div>
            {active ? (
              <div className="flex items-center justify-between bg-surface-container rounded-xl px-md py-sm">
                <div className="flex items-center gap-md">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg">person</span>
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-on-surface">{active.full_name}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      Sejak {formatDate(active.start_date)}
                      {active.resident_type && ` · ${active.resident_type === 'owner' ? 'Pemilik' : 'Penyewa'}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { onClose(); onUnassign(house, active); }}
                  className="flex items-center gap-xs text-error hover:opacity-80 transition-opacity text-body-sm"
                >
                  <span className="material-symbols-outlined text-base">person_remove</span>
                  Cabut
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-md bg-surface-container-low rounded-xl px-md py-sm text-on-surface-variant/60">
                <span className="material-symbols-outlined text-lg">home_work</span>
                <p className="text-body-sm">Rumah kosong — belum ada penghuni aktif</p>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-sm">Riwayat Penghuni</h3>
              <div className="space-y-xs max-h-40 overflow-y-auto pr-xs">
                {history.map((r, i) => (
                  <div key={`${r.id}-${i}`} className="flex items-center justify-between bg-surface-container-low rounded-lg px-md py-xs">
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-on-surface-variant/40 text-base">history</span>
                      <p className="text-[12px] text-on-surface-variant">{r.full_name}</p>
                    </div>
                    <p className="font-mono-data text-[11px] text-on-surface-variant/60">
                      {formatDate(r.start_date)} — {formatDate(r.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-sm border-t border-outline-variant/20">
            <p className="font-label-caps text-[10px] text-on-surface-variant/50 uppercase">
              ID #{house.id}
            </p>
            <Button variant="secondary" onClick={onClose}>Tutup</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HousesPage() {
  const [houses, setHouses] = useState([]);
  const [stats, setStats] = useState({ total: 0, occupied: 0, vacant: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1, per_page: 15 });
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [detailModal, setDetailModal] = useState({ open: false, houseId: null });
  const [assignModal, setAssignModal] = useState({ open: false, house: null });
  const [unassignModal, setUnassignModal] = useState({ open: false, house: null, resident: null });

  const fetchHouses = () => {
    setLoading(true);
    houseApi.getHouses({ search, status: statusFilter, ownership_type: ownershipFilter, page, per_page: 15 })
      .then((res) => {
        setHouses(res.data.data ?? []);
        setMeta(res.data.meta ?? { total: 0, last_page: 1, per_page: 15 });
      })
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    Promise.all([
      houseApi.getHouses({ per_page: 1 }),
      houseApi.getHouses({ per_page: 1, status: 'occupied' }),
      houseApi.getHouses({ per_page: 1, status: 'vacant' }),
    ]).then(([all, occ, vac]) => {
      setStats({
        total: all.data.meta?.total ?? 0,
        occupied: occ.data.meta?.total ?? 0,
        vacant: vac.data.meta?.total ?? 0,
      });
    });
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); }, [search, statusFilter, ownershipFilter]);
  useEffect(() => { fetchHouses(); }, [search, statusFilter, ownershipFilter, page]);

  const handleSaved = () => { fetchHouses(); fetchStats(); };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Hapus rumah ini? Tindakan tidak bisa dibatalkan.')) return;
    try {
      await houseApi.deleteHouse(id);
      handleSaved();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Gagal menghapus rumah.');
    }
  };

  const openAssign = (house) => {
    setDetailModal({ open: false, houseId: null });
    setAssignModal({ open: true, house });
  };

  const openUnassign = (house, resident) => {
    setDetailModal({ open: false, houseId: null });
    setUnassignModal({ open: true, house, resident });
  };

  const openEdit = (house) => {
    setFormModal({ open: true, initial: house });
  };

  const statCards = [
    { label: 'Total Rumah',  value: stats.total,    icon: 'home',           color: 'text-primary',           bg: 'bg-primary/10' },
    { label: 'Dihuni',       value: stats.occupied, icon: 'family_restroom',color: 'text-primary',           bg: 'bg-primary/10' },
    { label: 'Kosong',       value: stats.vacant,   icon: 'home_work',      color: 'text-on-surface-variant',bg: 'bg-surface-container' },
  ];

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-md text-on-surface">Data Rumah</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Kelola data rumah, penghuni, dan riwayat hunian</p>
        </div>
        <Button onClick={() => setFormModal({ open: true, initial: null })}>
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Rumah
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="glass-card p-lg rounded-xl flex items-center gap-md h-24">
            <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-mono-data text-3xl font-bold ${color}`}>{value}</p>
              <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-sm">
        <div className="flex items-center bg-surface-container-low px-md py-1.5 rounded-full border border-outline-variant/20 flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
          <input
            placeholder="Cari nomor atau blok..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-body-sm w-full ml-sm placeholder:text-on-surface-variant/50 text-on-surface"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-on-surface-variant/50 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="occupied">Dihuni</option>
          <option value="vacant">Kosong</option>
        </select>

        <select
          value={ownershipFilter}
          onChange={(e) => setOwnershipFilter(e.target.value)}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          <option value="permanent">Milik Sendiri</option>
          <option value="rental">Sewa</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['No. Rumah', 'Blok', 'Alamat', 'Tipe', 'Status', 'Penghuni Aktif', ''].map((h) => (
                <th key={h} className="px-lg py-md text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider first:pl-lg last:pr-lg">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-xl">
                  <div className="flex items-center justify-center gap-md text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : houses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-xl">
                  <div className="flex flex-col items-center gap-sm text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-4xl">home_work</span>
                    <p className="text-body-sm">Tidak ada data rumah ditemukan</p>
                  </div>
                </td>
              </tr>
            ) : houses.map((h) => (
              <tr
                key={h.id}
                className="hover:bg-primary/5 transition-colors cursor-pointer group"
                onClick={() => setDetailModal({ open: true, houseId: h.id })}
              >
                <td className="px-lg py-md">
                  <span className="font-mono-data font-semibold text-on-surface">{h.house_number}</span>
                </td>
                <td className="px-lg py-md text-on-surface-variant">{h.block ?? '—'}</td>
                <td className="px-lg py-md text-on-surface-variant max-w-[200px] truncate">{h.address ?? '—'}</td>
                <td className="px-lg py-md">
                  <Badge value={h.ownership_type === 'permanent' ? 'owner' : 'rental'} />
                </td>
                <td className="px-lg py-md"><Badge value={h.status} dot /></td>
                <td className="px-lg py-md">
                  {h.active_resident ? (
                    <div className="flex items-center gap-sm">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                      </div>
                      <span className="text-on-surface text-[12px]">{h.active_resident.full_name}</span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant/40 text-[12px]">—</span>
                  )}
                </td>
                <td className="px-lg py-md text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setFormModal({ open: true, initial: h })}
                      className="p-1 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, h.id)}
                      className="p-1 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-lg py-md border-t border-outline-variant/20 bg-surface-container-low/30">
            <p className="text-[12px] text-on-surface-variant">
              Menampilkan <span className="font-medium text-on-surface">{houses.length}</span> dari{' '}
              <span className="font-medium text-on-surface">{meta.total}</span> rumah
            </p>
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.last_page || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-sm text-on-surface-variant/50 text-body-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-body-sm font-medium transition-colors ${
                        p === page
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <HouseFormModal
        open={formModal.open}
        initial={formModal.initial}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={handleSaved}
      />
      <HouseDetailModal
        open={detailModal.open}
        houseId={detailModal.houseId}
        onClose={() => setDetailModal({ open: false, houseId: null })}
        onEdit={openEdit}
        onAssign={openAssign}
        onUnassign={openUnassign}
      />
      <AssignModal
        open={assignModal.open}
        house={assignModal.house}
        onClose={() => setAssignModal({ open: false, house: null })}
        onSaved={() => { handleSaved(); }}
      />
      <UnassignModal
        open={unassignModal.open}
        house={unassignModal.house}
        resident={unassignModal.resident}
        onClose={() => setUnassignModal({ open: false, house: null, resident: null })}
        onSaved={() => { handleSaved(); }}
      />
    </div>
  );
}
