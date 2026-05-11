import { useEffect, useMemo, useState } from 'react';
import * as expenseApi from '../api/expenseApi';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency, formatDate, MONTHS } from '../utils/format';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

// Convert year+month to date_from / date_to
function toDateRange(year, month) {
  const y = Number(year);
  const m = Number(month);
  const from = `${y}-${String(m).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${y}-${String(m).padStart(2, '0')}-${lastDay}`;
  return { date_from: from, date_to: to };
}

// ─── Category Modal ────────────────────────────────────────────────────────────
function CategoryModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', frequency: 'occasional', description: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { setForm({ name: '', frequency: 'occasional', description: '' }); setErrors({}); }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await expenseApi.createCategory(form);
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? { name: [err.response?.data?.message ?? 'Gagal'] });
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tambah Kategori">
      <form onSubmit={handleSubmit} className="space-y-md">
        <Input
          label="Nama Kategori"
          value={form.name}
          onChange={set('name')}
          error={errors.name?.[0]}
          required
          placeholder="cth. Kebersihan, Keamanan, dll."
        />
        <Select label="Frekuensi" value={form.frequency} onChange={set('frequency')}>
          <option value="monthly">Bulanan</option>
          <option value="occasional">Sewaktu-waktu</option>
        </Select>
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={set('description')}
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

// ─── Expense Form Modal ────────────────────────────────────────────────────────
function ExpenseFormModal({ open, onClose, onSaved, initial, categories }) {
  const empty = {
    title: '', expense_category_id: '', amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    description: '', receipt_photo: null,
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? '',
        expense_category_id: initial.category?.id ?? '',
        amount: initial.amount ?? '',
        expense_date: initial.expense_date ?? '',
        description: initial.description ?? '',
        receipt_photo: null,
      });
      setPreview(initial.receipt_url ?? null);
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
    setForm((f) => ({ ...f, receipt_photo: file }));
    if (file.type.startsWith('image/')) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    // Build FormData — backend requires multipart for file upload
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v);
    });
    try {
      initial?.id
        ? await expenseApi.updateExpense(initial.id, fd)
        : await expenseApi.createExpense(fd);
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-md">
        <Input
          label="Judul Pengeluaran"
          value={form.title}
          onChange={set('title')}
          error={errors.title?.[0]}
          required
          placeholder="cth. Bayar listrik, Beli sapu, dll."
        />
        <Select
          label="Kategori"
          value={form.expense_category_id}
          onChange={set('expense_category_id')}
          error={errors.expense_category_id?.[0]}
          required
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.frequency === 'monthly' ? 'Bulanan' : 'Sewaktu'})</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-md">
          <Input
            label="Jumlah (Rp)"
            type="number"
            min="1"
            value={form.amount}
            onChange={set('amount')}
            error={errors.amount?.[0]}
            required
          />
          <Input
            label="Tanggal"
            type="date"
            value={form.expense_date}
            onChange={set('expense_date')}
            error={errors.expense_date?.[0]}
            required
          />
        </div>
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">
            Deskripsi
          </label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={2}
            placeholder="Opsional"
            className="input-dark w-full px-md py-sm text-body-sm resize-none"
          />
        </div>
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-xs">
            Bukti Pengeluaran
          </label>
          <label className="flex items-center gap-sm cursor-pointer">
            <div className="flex items-center gap-sm bg-surface-container border border-outline-variant/30 hover:border-primary/50 transition-colors rounded-xl px-md py-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">upload_file</span>
              <span className="text-body-sm text-on-surface-variant">
                {form.receipt_photo ? form.receipt_photo.name : 'Pilih file (JPG, PNG, PDF · maks 2 MB)'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
          {preview && (
            <img src={preview} alt="preview" className="mt-sm h-28 w-auto rounded-xl border border-outline-variant/20 object-cover" />
          )}
          {initial?.receipt_url && !form.receipt_photo && (
            <a
              href={initial.receipt_url}
              target="_blank"
              rel="noreferrer"
              className="mt-xs flex items-center gap-xs text-primary text-body-sm hover:underline"
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Lihat bukti saat ini
            </a>
          )}
        </div>
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            <span className="material-symbols-outlined text-lg">{initial?.id ? 'save' : 'add'}</span>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [catModal, setCatModal] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    const { date_from, date_to } = toDateRange(year, month);
    const params = { date_from, date_to, page, per_page: 25 };
    if (categoryFilter) params.category_id = categoryFilter;
    expenseApi.getExpenses(params)
      .then((res) => {
        setExpenses(res.data.data ?? []);
        setMeta(res.data.meta ?? { total: 0, last_page: 1 });
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    expenseApi.getCategories().then((res) => setCategories(res.data.data ?? []));
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { setPage(1); }, [year, month, categoryFilter]);
  useEffect(() => { fetchExpenses(); }, [year, month, categoryFilter, page]);

  const totalMonth = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    [expenses]
  );

  const topCategory = useMemo(() => {
    if (!expenses.length) return null;
    const bycat = {};
    expenses.forEach((e) => {
      const name = e.category?.name ?? 'Lain-lain';
      bycat[name] = (bycat[name] ?? 0) + Number(e.amount);
    });
    return Object.entries(bycat).sort((a, b) => b[1] - a[1])[0];
  }, [expenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pengeluaran ini? Tindakan tidak bisa dibatalkan.')) return;
    try {
      await expenseApi.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      alert(err.response?.data?.message ?? 'Gagal menghapus pengeluaran.');
    }
  };

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-on-surface">Pengeluaran</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Rekam dan kelola pengeluaran operasional RT</p>
        </div>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={() => setCatModal(true)}>
            <span className="material-symbols-outlined text-lg">category</span>
            Tambah Kategori
          </Button>
          <Button onClick={() => setFormModal({ open: true, initial: null })}>
            <span className="material-symbols-outlined text-lg">add</span>
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-sm">
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-lg">filter_list</span>
          <span className="font-label-caps text-[11px] uppercase">Filter:</span>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        <div className="glass-card p-lg rounded-xl flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-2xl">trending_down</span>
          </div>
          <div>
            <p className="font-mono-data text-xl font-bold text-error">{formatCurrency(totalMonth)}</p>
            <p className="font-label-caps text-[11px] text-on-surface-variant uppercase mt-0.5">
              Total {MONTHS[month - 1]} {year}
            </p>
          </div>
        </div>
        <div className="glass-card p-lg rounded-xl flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">receipt</span>
          </div>
          <div>
            <p className="font-mono-data text-xl font-bold text-on-surface">{meta.total}</p>
            <p className="font-label-caps text-[11px] text-on-surface-variant uppercase mt-0.5">Jumlah Transaksi</p>
          </div>
        </div>
        <div className="glass-card p-lg rounded-xl flex items-center gap-md">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary text-2xl">category</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-on-surface truncate">
              {topCategory ? topCategory[0] : '—'}
            </p>
            <p className="font-label-caps text-[11px] text-on-surface-variant uppercase mt-0.5">
              {topCategory ? formatCurrency(topCategory[1]) : 'Belum ada data'}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Judul', 'Kategori', 'Jumlah', 'Tanggal', 'Dicatat', 'Bukti', ''].map((h) => (
                <th key={h} className="px-lg py-md text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
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
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-xl">
                  <div className="flex flex-col items-center gap-sm text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-4xl">receipt_long</span>
                    <p className="text-body-sm">Tidak ada pengeluaran pada periode ini</p>
                  </div>
                </td>
              </tr>
            ) : expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-lg py-md">
                  <div>
                    <p className="font-medium text-on-surface">{exp.title}</p>
                    {exp.description && (
                      <p className="text-[11px] text-on-surface-variant/60 mt-0.5 max-w-[200px] truncate">{exp.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-lg py-md">
                  {exp.category ? (
                    <div className="flex items-center gap-xs">
                      <span className="text-on-surface-variant">{exp.category.name}</span>
                      <span className={`font-label-caps text-[9px] uppercase px-xs py-0.5 rounded-full ${
                        exp.category.frequency === 'monthly'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {exp.category.frequency === 'monthly' ? 'Bulanan' : 'Sewaktu'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-on-surface-variant/40">—</span>
                  )}
                </td>
                <td className="px-lg py-md">
                  <span className="font-mono-data font-semibold text-error whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </span>
                </td>
                <td className="px-lg py-md text-on-surface-variant whitespace-nowrap">
                  {formatDate(exp.expense_date)}
                </td>
                <td className="px-lg py-md text-on-surface-variant text-[12px]">
                  {exp.created_by?.name ?? '—'}
                </td>
                <td className="px-lg py-md">
                  {exp.receipt_url ? (
                    <a
                      href={exp.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e2) => e2.stopPropagation()}
                      className="flex items-center gap-xs text-primary hover:opacity-80 transition-opacity text-[12px]"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      Lihat
                    </a>
                  ) : (
                    <span className="text-on-surface-variant/40 text-[12px]">—</span>
                  )}
                </td>
                <td className="px-lg py-md text-right" onClick={(e2) => e2.stopPropagation()}>
                  <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setFormModal({ open: true, initial: exp })}
                      className="p-1 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
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
              Menampilkan <span className="font-medium text-on-surface">{expenses.length}</span> dari{' '}
              <span className="font-medium text-on-surface">{meta.total}</span> pengeluaran
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
          </div>
        )}
      </div>

      {/* Modals */}
      <ExpenseFormModal
        open={formModal.open}
        initial={formModal.initial}
        categories={categories}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={fetchExpenses}
      />
      <CategoryModal
        open={catModal}
        onClose={() => setCatModal(false)}
        onSaved={fetchCategories}
      />
    </div>
  );
}
