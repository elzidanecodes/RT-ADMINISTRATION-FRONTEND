import { useEffect, useState } from 'react';
import * as residentApi from '../api/residentApi';
import * as billApi from '../api/billApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatDate, formatCurrency } from '../utils/format';

// ─── Form Modal ────────────────────────────────────────────────────────────────
// Backend fields: full_name, phone_number, resident_type (permanent/contract),
//                 is_married (boolean), ktp_photo (file, required on create)
function ResidentFormModal({ open, onClose, onSaved, initial }) {
  const empty = {
    full_name: '', phone_number: '',
    resident_type: 'permanent', is_married: '0', ktp_photo: null,
  };
  const [form, setForm] = useState(empty);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        full_name: initial.full_name ?? '',
        phone_number: initial.phone_number ?? '',
        resident_type: initial.resident_type ?? 'permanent',
        is_married: initial.is_married ? '1' : '0',
        ktp_photo: null,
      });
      setPreview(initial.ktp_photo_url ?? null);
    } else {
      setForm(empty);
      setPreview(null);
    }
    setErrors({});
  }, [initial, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, ktp_photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v);
    });
    try {
      initial?.id
        ? await residentApi.updateResident(initial.id, fd)
        : await residentApi.createResident(fd);
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Warga' : 'Tambah Warga'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-md">
        {Object.keys(errors).length > 0 && !errors.full_name && !errors.phone_number && !errors.ktp_photo && (
          <div className="flex items-start gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg mt-0.5">error</span>
            <div>
              {Object.entries(errors).map(([k, v]) => (
                <p key={k} className="text-body-sm text-error">{Array.isArray(v) ? v[0] : v}</p>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Nama Lengkap"
          value={form.full_name}
          onChange={set('full_name')}
          error={errors.full_name?.[0]}
          required
          placeholder="Nama sesuai KTP"
        />
        <Input
          label="No. Telepon"
          value={form.phone_number}
          onChange={set('phone_number')}
          error={errors.phone_number?.[0]}
          required
          placeholder="cth. 08123456789"
        />
        <div className="grid grid-cols-2 gap-md">
          <Select label="Tipe Warga" value={form.resident_type} onChange={set('resident_type')}>
            <option value="permanent">Tetap</option>
            <option value="contract">Kontrak</option>
          </Select>
          <Select label="Status Pernikahan" value={form.is_married} onChange={set('is_married')}>
            <option value="0">Belum Menikah</option>
            <option value="1">Sudah Menikah</option>
          </Select>
        </div>

        {/* KTP Photo — styled same as expense receipt */}
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">
            Foto KTP {!initial?.id && <span className="text-error">*</span>}
          </label>
          <label className="flex items-center gap-sm cursor-pointer">
            <div className="flex items-center gap-sm bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-colors rounded-xl px-md py-sm w-full">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">upload_file</span>
              <span className="text-body-sm text-on-surface-variant truncate">
                {form.ktp_photo ? form.ktp_photo.name : 'Pilih foto KTP (JPG, PNG · maks 2 MB)'}
              </span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          {errors.ktp_photo && <p className="text-xs text-error mt-xs">{errors.ktp_photo[0]}</p>}
          {preview && (
            <img src={preview} alt="KTP Preview" className="mt-sm h-28 w-auto rounded-xl border border-outline-variant/20 object-cover" />
          )}
          {initial?.ktp_photo_url && !form.ktp_photo && (
            <a
              href={initial.ktp_photo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-xs flex items-center gap-xs text-primary text-body-sm hover:underline"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Lihat foto KTP saat ini
            </a>
          )}
        </div>

        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            <span className="material-symbols-outlined text-lg">{initial?.id ? 'save' : 'person_add'}</span>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Detail Modal ──────────────────────────────────────────────────────────────
// Loads fresh data via getResident(id) + unpaid bills via billApi
function ResidentDetailModal({ open, onClose, residentId, onEdit, onDelete }) {
  const [resident, setResident] = useState(null);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ktpVisible, setKtpVisible] = useState(false);

  useEffect(() => {
    if (!open || !residentId) return;
    setResident(null);
    setUnpaidBills([]);
    setKtpVisible(false);
    setLoading(true);
    Promise.all([
      residentApi.getResident(residentId),
      billApi.getBills({ resident_id: residentId, per_page: 10 }),
    ]).then(([rRes, bRes]) => {
      setResident(rRes.data.data);
      const allBills = bRes.data.data ?? [];
      setUnpaidBills(allBills.filter((b) => b.status !== 'paid'));
    }).finally(() => setLoading(false));
  }, [open, residentId]);

  if (!open) return null;

  // current_house is an array from the API (BelongsToMany mapped)
  const house = resident?.current_house?.[0] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-card rounded-xl overflow-hidden flex flex-col shadow-2xl">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-md right-md z-10 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">close</span>
        </button>

        {loading || !resident ? (
          <div className="flex items-center justify-center py-xl gap-md">
            <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
            <p className="text-body-sm text-on-surface-variant">Memuat profil warga...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <header
              className="p-xl border-b border-outline-variant/30 flex flex-col md:flex-row items-center md:items-end gap-lg"
              style={{ background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent)' }}
            >
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl bg-surface-container-high flex items-center justify-center">
                  {resident.ktp_photo_url ? (
                    <img src={resident.ktp_photo_url} alt={resident.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-5xl">person</span>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-sm">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-sm">
                  <h1 className="font-display-lg text-headline-md tracking-tight text-on-surface">{resident.full_name}</h1>
                  <Badge value={resident.resident_type} />
                  <span className="px-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-label-caps text-[10px] border border-outline-variant/20">
                    {resident.is_married ? 'Sudah Menikah' : 'Belum Menikah'}
                  </span>
                </div>
                <p className="text-on-surface-variant text-body-sm">{resident.phone_number}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-sm pt-sm">
                  <button
                    onClick={() => { onClose(); onEdit(resident); }}
                    className="px-md h-9 bg-primary text-on-primary rounded-lg font-label-caps flex items-center gap-sm transition-all primary-glow active:scale-95 text-body-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    Edit Profil
                  </button>
                  <button
                    onClick={() => { onClose(); onDelete(resident.id); }}
                    className="px-md h-9 bg-error/10 text-error border border-error/20 rounded-lg font-label-caps flex items-center gap-sm transition-all hover:bg-error/20 active:scale-95 text-body-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    Hapus
                  </button>
                </div>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">

                {/* Left Column */}
                <div className="lg:col-span-7 space-y-xl">
                  {/* Personal Info */}
                  <section>
                    <div className="flex items-center gap-sm mb-md">
                      <span className="material-symbols-outlined text-primary">person</span>
                      <h3 className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]">Informasi Pribadi</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-md bg-surface-container/50 p-md rounded-xl border border-outline-variant/10">
                      {[
                        ['NAMA LENGKAP', resident.full_name],
                        ['NO. TELEPON', resident.phone_number],
                        ['TIPE WARGA', resident.resident_type === 'permanent' ? 'Tetap' : 'Kontrak'],
                        ['STATUS PERNIKAHAN', resident.is_married ? 'Sudah Menikah' : 'Belum Menikah'],
                        ['TERDAFTAR SEJAK', formatDate(resident.created_at)],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="space-y-xs">
                          <p className="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest">{lbl}</p>
                          <p className="text-body-sm text-on-surface font-medium">{val}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* KTP Section */}
                  <section>
                    <div className="flex items-center gap-sm mb-md">
                      <span className="material-symbols-outlined text-primary">badge</span>
                      <h3 className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]">Foto KTP</h3>
                    </div>
                    <div
                      className="relative group h-44 rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest cursor-pointer"
                      onClick={() => setKtpVisible((v) => !v)}
                    >
                      {!ktpVisible && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm transition-all duration-300">
                          <span className="material-symbols-outlined text-primary text-4xl mb-sm">visibility</span>
                          <p className="font-label-caps text-[11px] text-on-surface uppercase">Klik untuk lihat KTP</p>
                        </div>
                      )}
                      {resident.ktp_photo_url ? (
                        <img
                          src={resident.ktp_photo_url}
                          alt="KTP"
                          className={`w-full h-full object-cover transition-all duration-300 ${ktpVisible ? 'grayscale-0' : 'grayscale opacity-30'}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                          <span className="material-symbols-outlined text-5xl">image_not_supported</span>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-5 space-y-xl">
                  {/* House Info */}
                  {house ? (
                    <div
                      className="p-lg rounded-xl relative overflow-hidden border border-primary/20"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}
                    >
                      <div className="absolute -right-4 -top-4 opacity-10">
                        <span className="material-symbols-outlined" style={{ fontSize: 96 }}>home</span>
                      </div>
                      <div className="relative z-10 space-y-md">
                        <h3 className="font-label-caps text-primary uppercase tracking-widest text-[11px]">Tempat Tinggal</h3>
                        <div className="flex justify-between items-end border-b border-primary/10 pb-sm">
                          <p className="text-on-surface-variant font-label-caps text-[10px] uppercase">NOMOR RUMAH</p>
                          <p className="font-display-lg text-headline-md text-primary">{house.house_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-md text-body-sm">
                          {house.block && (
                            <div>
                              <p className="text-on-surface-variant font-label-caps text-[10px] uppercase mb-xs">BLOK</p>
                              <p className="font-medium text-on-surface">{house.block}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-on-surface-variant font-label-caps text-[10px] uppercase mb-xs">TINGGAL SEJAK</p>
                            <p className="font-medium text-on-surface">{formatDate(house.start_date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-lg rounded-xl border border-outline-variant/20 bg-surface-container/30 text-center">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-5xl">home_work</span>
                      <p className="text-on-surface-variant text-body-sm mt-sm">Belum ditetapkan ke rumah</p>
                    </div>
                  )}

                  {/* Unpaid Bills */}
                  <section>
                    <div className="flex items-center justify-between mb-md">
                      <div className="flex items-center gap-sm">
                        <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
                        <h3 className="font-label-caps text-on-surface-variant uppercase tracking-widest text-[11px]">Tagihan Belum Lunas</h3>
                      </div>
                      {unpaidBills.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-error flex items-center justify-center">
                          <span className="font-mono-data text-[10px] text-white font-bold">{unpaidBills.length}</span>
                        </span>
                      )}
                    </div>
                    <div className="rounded-xl border border-outline-variant/10 overflow-hidden bg-surface-container/30">
                      {unpaidBills.length === 0 ? (
                        <div className="px-md py-lg flex flex-col items-center gap-sm text-on-surface-variant/60">
                          <span className="material-symbols-outlined text-2xl">check_circle</span>
                          <p className="text-body-sm">Semua tagihan sudah lunas</p>
                        </div>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-surface-container-high/50">
                              {['Periode', 'Jenis', 'Sisa', 'Status'].map((h) => (
                                <th key={h} className="px-md py-sm font-label-caps text-[10px] text-on-surface-variant uppercase">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/10">
                            {unpaidBills.map((b) => (
                              <tr key={b.id} className="hover:bg-surface-container-high/30 transition-colors">
                                <td className="px-md py-sm font-mono-data text-[12px] text-on-surface whitespace-nowrap">
                                  {String(b.period_month).padStart(2,'0')}/{b.period_year}
                                </td>
                                <td className="px-md py-sm text-[12px] text-on-surface-variant">
                                  {b.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'}
                                </td>
                                <td className="px-md py-sm font-mono-data text-[12px] text-error font-semibold whitespace-nowrap">
                                  {formatCurrency(b.remaining)}
                                </td>
                                <td className="px-md py-sm">
                                  <Badge value={b.status} dot />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </section>

                  {/* Resident ID Chip */}
                  <div className="p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/10">
                    <p className="text-on-surface-variant font-label-caps text-[10px] uppercase mb-xs">ID WARGA</p>
                    <p className="font-mono-data text-body-sm text-on-surface break-all">{resident.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="px-lg py-md border-t border-outline-variant/30 bg-surface-container-lowest/50 flex justify-between items-center">
              <div className="flex items-center gap-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">history</span>
                <span className="font-label-caps text-[10px] uppercase">Terdaftar {formatDate(resident.created_at)}</span>
              </div>
              <button
                onClick={onClose}
                className="px-lg h-9 bg-surface-container-highest border border-outline-variant/30 hover:text-primary rounded-lg font-label-caps text-on-surface transition-all active:scale-95 text-body-sm"
              >
                Tutup
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ResidentsPage() {
  const [residents, setResidents] = useState([]);
  const [stats, setStats] = useState({ total: 0, permanent: 0, contract: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [loading, setLoading] = useState(true);

  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [detailModal, setDetailModal] = useState({ open: false, residentId: null });

  const fetchResidents = () => {
    setLoading(true);
    const params = { page, per_page: 15 };
    if (search) params.search = search;
    if (typeFilter) params.resident_type = typeFilter;
    residentApi.getResidents(params)
      .then((res) => {
        setResidents(res.data.data ?? []);
        setMeta(res.data.meta ?? { total: 0, last_page: 1 });
      })
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    Promise.all([
      residentApi.getResidents({ per_page: 1 }),
      residentApi.getResidents({ per_page: 1, resident_type: 'permanent' }),
      residentApi.getResidents({ per_page: 1, resident_type: 'contract' }),
    ]).then(([all, perm, cont]) => {
      setStats({
        total: all.data.meta?.total ?? 0,
        permanent: perm.data.meta?.total ?? 0,
        contract: cont.data.meta?.total ?? 0,
      });
    });
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(1); }, [search, typeFilter]);
  useEffect(() => { fetchResidents(); }, [search, typeFilter, page]);

  const handleSaved = () => { fetchResidents(); fetchStats(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus warga ini? Tindakan tidak bisa dibatalkan.')) return;
    try {
      await residentApi.deleteResident(id);
      handleSaved();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Gagal menghapus warga.');
    }
  };

  const openEdit = (r) => setFormModal({ open: true, initial: r });

  const statCards = [
    { label: 'Total Warga',     value: stats.total,     icon: 'groups',        color: 'text-primary',   bg: 'bg-primary/10' },
    { label: 'Warga Tetap',     value: stats.permanent, icon: 'how_to_reg',    color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Warga Kontrak',   value: stats.contract,  icon: 'contract',      color: 'text-tertiary',  bg: 'bg-tertiary/10' },
  ];

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline-md text-on-surface">Data Warga</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Kelola semua warga terdaftar di lingkungan RT</p>
        </div>
        <Button onClick={() => setFormModal({ open: true, initial: null })}>
          <span className="material-symbols-outlined text-lg">person_add</span>
          Tambah Warga
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        {statCards.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="glass-card p-lg rounded-xl flex items-center gap-md h-24">
            <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
            </div>
            <div>
              <p className={`font-mono-data text-3xl font-bold ${color}`}>{loading && value === 0 ? '—' : value}</p>
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
            placeholder="Cari nama atau no. telepon..."
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          <option value="permanent">Tetap</option>
          <option value="contract">Kontrak</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                {['Warga', 'No. Telepon', 'Tipe', 'No. Rumah', ''].map((h) => (
                  <th key={h} className="px-lg py-md font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-xl">
                    <div className="flex items-center justify-center gap-md text-on-surface-variant">
                      <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : residents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-xl">
                    <div className="flex flex-col items-center gap-sm text-on-surface-variant/60">
                      <span className="material-symbols-outlined text-4xl">group_off</span>
                      <p className="text-body-sm">Tidak ada warga ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : residents.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  onClick={() => setDetailModal({ open: true, residentId: r.id })}
                >
                  {/* Nama + foto */}
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container-high flex items-center justify-center shrink-0">
                        {r.ktp_photo_url ? (
                          <img src={r.ktp_photo_url} alt={r.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant/40">person</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-body-sm">{r.full_name}</p>
                        <p className="text-[11px] text-on-surface-variant/60">ID #{r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md text-on-surface-variant text-body-sm">
                    {r.phone_number ?? '—'}
                  </td>
                  <td className="px-lg py-md">
                    <Badge value={r.resident_type} />
                  </td>
                  <td className="px-lg py-md font-mono-data text-on-surface">
                    {/* current_house is array from API */}
                    {r.current_house?.[0]?.house_number ?? '—'}
                  </td>
                  <td className="px-lg py-md text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setDetailModal({ open: true, residentId: r.id })}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                        title="Lihat Detail"
                      >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                      </button>
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
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
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-lg py-md border-t border-outline-variant/20 bg-surface-container-low/30">
          <p className="text-[12px] text-on-surface-variant">
            Menampilkan <span className="font-medium text-on-surface">{residents.length}</span> dari{' '}
            <span className="font-medium text-on-surface">{meta.total}</span> warga
          </p>
          {meta.last_page > 1 && (
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
                    <span key={`e-${i}`} className="px-sm text-on-surface-variant/50 text-body-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-body-sm font-medium transition-colors ${
                        p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
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
          )}
        </div>
      </div>

      {/* Modals */}
      <ResidentFormModal
        open={formModal.open}
        initial={formModal.initial}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={handleSaved}
      />
      <ResidentDetailModal
        open={detailModal.open}
        residentId={detailModal.residentId}
        onClose={() => setDetailModal({ open: false, residentId: null })}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
