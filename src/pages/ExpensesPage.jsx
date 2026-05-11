import { useEffect, useState } from 'react';
import * as expenseApi from '../api/expenseApi';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency, formatDate, MONTHS } from '../utils/format';
import { PlusIcon } from '@heroicons/react/24/outline';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function ExpenseFormModal({ open, onClose, onSaved, initial, categories }) {
  const emptyForm = { title: '', category_id: '', amount: '', expense_date: '', description: '', receipt: null };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({ ...emptyForm, ...initial, category_id: initial.category?.id ?? '', receipt: null });
      setReceiptPreview(initial.receipt_url ?? null);
    } else {
      setForm(emptyForm);
      setReceiptPreview(null);
    }
    setErrors({});
  }, [initial, open]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, receipt: file }));
    if (file.type.startsWith('image/')) setReceiptPreview(URL.createObjectURL(file));
    else setReceiptPreview(null);
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
      if (initial?.id) {
        await expenseApi.updateExpense(initial.id, fd);
      } else {
        await expenseApi.createExpense(fd);
      }
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.response?.data?.errors ?? {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?.id ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title?.[0]} required />
        <Select label="Kategori" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} error={errors.category_id?.[0]}>
          <option value="">-- Pilih Kategori --</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Jumlah (Rp)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} error={errors.amount?.[0]} required />
          <Input label="Tanggal" type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} error={errors.expense_date?.[0]} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Bukti Pengeluaran</label>
          <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="text-sm" />
          {receiptPreview && (
            <img src={receiptPreview} alt="preview" className="mt-2 h-24 w-auto rounded-lg border border-gray-200 object-cover" />
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

function AddCategoryModal({ open, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setName(''); setError(''); }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await expenseApi.createCategory({ name });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Tambah Kategori">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input label="Nama Kategori" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: currentYear, month: new Date().getMonth() + 1 });
  const [formModal, setFormModal] = useState({ open: false, initial: null });
  const [catModal, setCatModal] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    expenseApi.getExpenses(filters)
      .then((res) => setExpenses(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    expenseApi.getCategories().then((res) => setCategories(res.data.data ?? []));
  };

  useEffect(() => { fetchExpenses(); }, [filters]);
  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pengeluaran ini?')) return;
    await expenseApi.deleteExpense(id);
    fetchExpenses();
  };

  const totalMonth = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-900">Pengeluaran</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCatModal(true)}>+ Kategori</Button>
          <Button onClick={() => setFormModal({ open: true, initial: null })}>
            <PlusIcon className="w-4 h-4" /> Tambah
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={filters.month} onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">Total bulan ini</span>
        <span className="text-lg font-bold text-red-600">{formatCurrency(totalMonth)}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Judul</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Bukti</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Memuat...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada pengeluaran.</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{e.title}</td>
                <td className="px-4 py-3 text-gray-500">{e.category?.name ?? '-'}</td>
                <td className="px-4 py-3 text-right text-red-600 font-medium">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(e.expense_date)}</td>
                <td className="px-4 py-3">
                  {e.receipt_url ? (
                    <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-xs">Lihat</a>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="secondary" className="text-xs py-1 px-2 mr-1" onClick={() => setFormModal({ open: true, initial: e })}>Edit</Button>
                  <Button variant="danger" className="text-xs py-1 px-2" onClick={() => handleDelete(e.id)}>Hapus</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExpenseFormModal
        open={formModal.open}
        initial={formModal.initial}
        categories={categories}
        onClose={() => setFormModal({ open: false, initial: null })}
        onSaved={fetchExpenses}
      />
      <AddCategoryModal open={catModal} onClose={() => setCatModal(false)} onSaved={fetchCategories} />
    </div>
  );
}
