import { useEffect, useState } from 'react';
import * as billApi from '../api/billApi';
import * as paymentApi from '../api/paymentApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency, formatDate, MONTHS } from '../utils/format';
import { FunnelIcon, BoltIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function GenerateModal({ open, onClose, onDone }) {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setResult(null); setError(''); }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await billApi.generateBills({ year, month });
      setResult(res.data.data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal generate tagihan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Tagihan Bulanan">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
            Berhasil: {result.created} tagihan dibuat, {result.skipped} sudah ada.
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tahun" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Bulan" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Tutup</Button>
          <Button type="submit" loading={loading}>Generate</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({ open, onClose, bill, onDone }) {
  const [form, setForm] = useState({ amount_paid: '', payment_date: '', payment_method: 'cash', notes: '', receipt: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({ amount_paid: bill?.remaining ?? '', payment_date: new Date().toISOString().slice(0, 10), payment_method: 'cash', notes: '', receipt: null });
    setError('');
  }, [bill, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await paymentApi.recordPayment({ ...form, bill_id: bill.id });
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal merekam pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rekam Pembayaran">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {bill && (
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
            <p><span className="text-gray-500">Rumah:</span> {bill.house_number} — {bill.resident_name}</p>
            <p><span className="text-gray-500">Tagihan:</span> {formatCurrency(bill.amount)} ({bill.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'})</p>
            <p><span className="text-gray-500">Sisa:</span> <span className="font-semibold text-red-600">{formatCurrency(bill.remaining)}</span></p>
          </div>
        )}
        <Input label="Jumlah Bayar" type="number" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} required />
        <Input label="Tanggal Bayar" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
        <Select label="Metode" value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
          <option value="cash">Tunai</option>
          <option value="transfer">Transfer</option>
        </Select>
        <Input label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Bukti Bayar (opsional)</label>
          <input type="file" accept="image/*,application/pdf" onChange={(e) => setForm({ ...form, receipt: e.target.files[0] })} className="text-sm" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}

function AnnualPayModal({ open, onClose, onDone }) {
  const [form, setForm] = useState({ resident_id: '', year: currentYear, bill_type: 'security', payment_date: new Date().toISOString().slice(0, 10) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { setError(''); setSuccess(''); }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await paymentApi.payAnnual(form);
      setSuccess(`Berhasil: ${res.data.data?.bills_paid ?? 0} tagihan dilunasi.`);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bayar Tahunan (12 Bulan)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <Input label="ID Warga (Resident ID)" value={form.resident_id} onChange={(e) => setForm({ ...form, resident_id: e.target.value })} required placeholder="UUID warga" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tahun" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Jenis Tagihan" value={form.bill_type} onChange={(e) => setForm({ ...form, bill_type: e.target.value })}>
            <option value="security">Keamanan</option>
            <option value="cleaning">Kebersihan</option>
          </Select>
        </div>
        <Input label="Tanggal Bayar" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Tutup</Button>
          <Button type="submit" loading={loading}>Proses</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: currentYear, month: new Date().getMonth() + 1, status: '', bill_type: '' });
  const [generateModal, setGenerateModal] = useState(false);
  const [payModal, setPayModal] = useState({ open: false, bill: null });
  const [annualModal, setAnnualModal] = useState(false);

  const fetchBills = () => {
    setLoading(true);
    const params = { ...filters };
    if (!params.status) delete params.status;
    if (!params.bill_type) delete params.bill_type;
    billApi.getBills(params)
      .then((res) => setBills(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBills(); }, [filters]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-900">Tagihan & Pembayaran</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAnnualModal(true)}>
            <CalendarDaysIcon className="w-4 h-4" /> Bayar Tahunan
          </Button>
          <Button onClick={() => setGenerateModal(true)}>
            <BoltIcon className="w-4 h-4" /> Generate Tagihan
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <FunnelIcon className="w-4 h-4 text-gray-400" />
        <Select value={filters.year} onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={filters.month} onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}>
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">Semua Status</option>
          <option value="unpaid">Belum Bayar</option>
          <option value="partial">Sebagian</option>
          <option value="paid">Lunas</option>
        </Select>
        <Select value={filters.bill_type} onChange={(e) => setFilters({ ...filters, bill_type: e.target.value })}>
          <option value="">Semua Jenis</option>
          <option value="security">Keamanan</option>
          <option value="cleaning">Kebersihan</option>
        </Select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Rumah</th>
              <th className="px-4 py-3 text-left">Warga</th>
              <th className="px-4 py-3 text-left">Jenis</th>
              <th className="px-4 py-3 text-right">Tagihan</th>
              <th className="px-4 py-3 text-right">Terbayar</th>
              <th className="px-4 py-3 text-right">Sisa</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Memuat data...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Tidak ada tagihan.</td></tr>
            ) : bills.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">{b.house_number}</td>
                <td className="px-4 py-3 text-gray-700">{b.resident_name}</td>
                <td className="px-4 py-3"><Badge value={b.bill_type} /></td>
                <td className="px-4 py-3 text-right">{formatCurrency(b.amount)}</td>
                <td className="px-4 py-3 text-right text-green-700">{formatCurrency(b.total_paid)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatCurrency(b.remaining)}</td>
                <td className="px-4 py-3"><Badge value={b.status} /></td>
                <td className="px-4 py-3 text-right">
                  {b.status !== 'paid' && (
                    <Button className="text-xs py-1 px-2" onClick={() => setPayModal({ open: true, bill: b })}>Bayar</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GenerateModal open={generateModal} onClose={() => setGenerateModal(false)} onDone={fetchBills} />
      <PaymentModal open={payModal.open} bill={payModal.bill} onClose={() => setPayModal({ open: false, bill: null })} onDone={fetchBills} />
      <AnnualPayModal open={annualModal} onClose={() => setAnnualModal(false)} onDone={fetchBills} />
    </div>
  );
}
