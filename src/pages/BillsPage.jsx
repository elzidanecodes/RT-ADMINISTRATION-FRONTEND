import { useEffect, useMemo, useState } from 'react';
import * as billApi from '../api/billApi';
import * as paymentApi from '../api/paymentApi';
import * as residentApi from '../api/residentApi';
import * as houseApi from '../api/houseApi';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { formatCurrency, formatDate, MONTHS } from '../utils/format';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

// ─── Generate Modal ────────────────────────────────────────────────────────────
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
    try {
      const res = await billApi.generateBills({ period_year: year, period_month: month });
      setResult(res.data.data);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal generate tagihan.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Tagihan Bulanan">
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}
        {result && (
          <div className="flex items-center gap-sm bg-primary/10 border border-primary/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
            <p className="text-body-sm text-primary">
              {result.created_count} tagihan dibuat, {result.skipped_count} sudah ada.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-md">
          <Select label="Tahun" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Bulan" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </Select>
        </div>
        <p className="text-[12px] text-on-surface-variant">
          Sistem akan membuat tagihan untuk semua penghuni aktif pada periode yang dipilih. Tagihan yang sudah ada akan dilewati.
        </p>
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Tutup</Button>
          <Button type="submit" loading={loading}>
            <span className="material-symbols-outlined text-lg">bolt</span>
            Generate
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ open, onClose, bill, onDone }) {
  const [form, setForm] = useState({
    amount_paid: '', payment_date: '', payment_method: 'cash',
    reference_number: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      amount_paid: bill?.remaining ?? '',
      payment_date: new Date().toISOString().slice(0, 10),
      payment_method: 'cash',
      reference_number: '',
      notes: '',
    });
    setError('');
  }, [bill, open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await paymentApi.recordPayment({ ...form, bill_id: bill.id });
      onDone();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal merekam pembayaran.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Rekam Pembayaran">
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}

        {bill && (
          <div className="bg-surface-container rounded-xl px-md py-sm space-y-xs">
            <div className="flex items-center gap-sm mb-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-base">receipt_long</span>
              </div>
              <div>
                <p className="text-body-sm font-medium text-on-surface">
                  Rumah {bill.house?.house_number} — {bill.resident?.full_name}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {bill.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'} · {MONTHS[(bill.period_month ?? 1) - 1]} {bill.period_year}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-xs pt-xs border-t border-outline-variant/20">
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-on-surface">{formatCurrency(bill.amount)}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Total</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-primary">{formatCurrency(bill.total_paid)}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Terbayar</p>
              </div>
              <div className="text-center">
                <p className="font-mono-data text-sm font-semibold text-error">{formatCurrency(bill.remaining)}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Sisa</p>
              </div>
            </div>
          </div>
        )}

        <Input
          label="Jumlah Bayar (Rp)"
          type="number"
          value={form.amount_paid}
          onChange={set('amount_paid')}
          min="1"
          required
        />
        <div className="grid grid-cols-2 gap-md">
          <Input label="Tanggal Bayar" type="date" value={form.payment_date} onChange={set('payment_date')} required />
          <Select label="Metode Pembayaran" value={form.payment_method} onChange={set('payment_method')}>
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer Bank</option>
          </Select>
        </div>
        {form.payment_method === 'transfer' && (
          <Input label="Nomor Referensi" value={form.reference_number} onChange={set('reference_number')} placeholder="No. transaksi / bukti transfer" />
        )}
        <Input label="Catatan" value={form.notes} onChange={set('notes')} placeholder="Opsional" />
        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>
            <span className="material-symbols-outlined text-lg">payments</span>
            Simpan Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Annual Pay Modal ──────────────────────────────────────────────────────────
function AnnualPayModal({ open, onClose, onDone }) {
  const [residents, setResidents] = useState([]);
  const [houses, setHouses] = useState([]);
  const [form, setForm] = useState({
    house_id: '', resident_id: '', bill_type: 'security',
    year: currentYear, payment_date: new Date().toISOString().slice(0, 10),
    payment_method: 'cash', reference_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;
    setError(''); setSuccess('');
    Promise.all([
      residentApi.getResidents({ per_page: 100, status: 'active' }),
      houseApi.getHouses({ per_page: 100, status: 'occupied' }),
    ]).then(([r, h]) => {
      setResidents(r.data.data ?? []);
      setHouses(h.data.data ?? []);
    });
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await paymentApi.payAnnual({
        ...form,
        house_id: Number(form.house_id),
        resident_id: Number(form.resident_id),
        year: Number(form.year),
      });
      setSuccess(`Berhasil: ${res.data.data?.bills_paid ?? 0} tagihan dilunasi.`);
      onDone();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Gagal memproses pembayaran tahunan.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Bayar Tahunan (12 Bulan)">
      <form onSubmit={handleSubmit} className="space-y-md">
        {error && (
          <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-error text-lg">error</span>
            <p className="text-body-sm text-error">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-sm bg-primary/10 border border-primary/20 rounded-xl px-md py-sm">
            <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
            <p className="text-body-sm text-primary">{success}</p>
          </div>
        )}

        <p className="text-[12px] text-on-surface-variant">
          Melunasi semua tagihan dalam 1 tahun penuh (12 bulan) untuk warga dan jenis tagihan yang dipilih.
        </p>

        <Select label="Pilih Warga" value={form.resident_id} onChange={set('resident_id')} required>
          <option value="">-- Pilih Warga --</option>
          {residents.map((r) => (
            <option key={r.id} value={r.id}>{r.full_name} — {r.nik}</option>
          ))}
        </Select>
        <Select label="Pilih Rumah" value={form.house_id} onChange={set('house_id')} required>
          <option value="">-- Pilih Rumah --</option>
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              Rumah {h.house_number}{h.block ? ` Blok ${h.block}` : ''}
              {h.active_resident ? ` — ${h.active_resident.full_name}` : ''}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-md">
          <Select label="Tahun" value={form.year} onChange={set('year')}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select label="Jenis Tagihan" value={form.bill_type} onChange={set('bill_type')}>
            <option value="security">Keamanan</option>
            <option value="cleaning">Kebersihan</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-md">
          <Input label="Tanggal Bayar" type="date" value={form.payment_date} onChange={set('payment_date')} required />
          <Select label="Metode Pembayaran" value={form.payment_method} onChange={set('payment_method')}>
            <option value="cash">Tunai</option>
            <option value="transfer">Transfer Bank</option>
          </Select>
        </div>
        {form.payment_method === 'transfer' && (
          <Input label="Nomor Referensi" value={form.reference_number} onChange={set('reference_number')} placeholder="No. transaksi" />
        )}

        <div className="flex justify-end gap-sm pt-sm">
          <Button variant="secondary" type="button" onClick={onClose}>Tutup</Button>
          <Button type="submit" loading={loading}>
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Proses Pembayaran
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Bill Detail Modal ─────────────────────────────────────────────────────────
function BillDetailModal({ open, onClose, billId, onPay }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !billId) return;
    setBill(null);
    setLoading(true);
    billApi.getBill(billId)
      .then((res) => setBill(res.data.data))
      .finally(() => setLoading(false));
  }, [open, billId]);

  const payments = bill?.payments ?? [];
  const paidPct = bill ? Math.min(100, Math.round((parseFloat(bill.total_paid) / parseFloat(bill.amount)) * 100)) : 0;

  return (
    <Modal open={open} onClose={onClose} title="" maxWidth="max-w-xl" hideTitle>
      {loading || !bill ? (
        <div className="flex items-center justify-center py-xl gap-md">
          <span className="material-symbols-outlined text-primary animate-spin text-2xl">progress_activity</span>
          <p className="text-body-sm text-on-surface-variant">Memuat detail tagihan...</p>
        </div>
      ) : (
        <div className="space-y-lg">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-md">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
              </div>
              <div>
                <h2 className="font-headline-md text-on-surface">
                  Tagihan {bill.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'}
                </h2>
                <p className="text-body-sm text-on-surface-variant mt-xs">
                  {MONTHS[(bill.period_month ?? 1) - 1]} {bill.period_year} · Rumah {bill.house?.house_number}
                </p>
              </div>
            </div>
            <Badge value={bill.status} />
          </div>

          {/* Resident info */}
          <div className="bg-surface-container-low rounded-xl px-md py-sm flex items-center gap-md">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
            <div>
              <p className="text-body-sm font-medium text-on-surface">{bill.resident?.full_name}</p>
              <p className="text-[11px] text-on-surface-variant">
                Jatuh Tempo: {formatDate(bill.due_date)}
              </p>
            </div>
          </div>

          {/* Amount summary */}
          <div className="grid grid-cols-3 gap-sm">
            {[
              { label: 'Total Tagihan', value: bill.amount, color: 'text-on-surface', bg: 'bg-surface-container' },
              { label: 'Terbayar', value: bill.total_paid, color: 'text-primary', bg: 'bg-primary/5' },
              { label: 'Sisa', value: bill.remaining, color: 'text-error', bg: 'bg-error/5' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl px-md py-sm text-center`}>
                <p className={`font-mono-data text-base font-bold ${color}`}>{formatCurrency(value)}</p>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-xs">
              <p className="font-label-caps text-[11px] text-on-surface-variant uppercase">Progress Pembayaran</p>
              <p className="font-mono-data text-[12px] text-primary">{paidPct}%</p>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>

          {/* Payment history */}
          <div>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-sm">
              Riwayat Pembayaran ({payments.length})
            </h3>
            {payments.length === 0 ? (
              <div className="flex items-center gap-md bg-surface-container-low rounded-xl px-md py-sm text-on-surface-variant/60">
                <span className="material-symbols-outlined text-lg">payments</span>
                <p className="text-body-sm">Belum ada pembayaran tercatat</p>
              </div>
            ) : (
              <div className="space-y-xs max-h-44 overflow-y-auto pr-xs">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-surface-container-low rounded-xl px-md py-sm">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-sm">
                          {p.payment_method === 'transfer' ? 'account_balance' : 'payments'}
                        </span>
                      </div>
                      <div>
                        <p className="font-mono-data text-sm font-semibold text-primary">{formatCurrency(p.amount_paid)}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {formatDate(p.payment_date)}
                          {p.reference_number && ` · Ref: ${p.reference_number}`}
                          {p.recorded_by && ` · ${p.recorded_by.name}`}
                        </p>
                      </div>
                    </div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase bg-surface-container-high px-sm py-0.5 rounded-full">
                      {p.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-sm border-t border-outline-variant/20">
            <p className="font-label-caps text-[10px] text-on-surface-variant/50 uppercase">
              ID #{bill.id}
            </p>
            <div className="flex gap-sm">
              <Button variant="secondary" onClick={onClose}>Tutup</Button>
              {bill.status !== 'paid' && (
                <Button onClick={() => { onClose(); onPay(bill); }}>
                  <span className="material-symbols-outlined text-lg">payments</span>
                  Bayar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [filters, setFilters] = useState({
    period_year: currentYear,
    period_month: new Date().getMonth() + 1,
    status: '',
    bill_type: '',
  });

  const [detailModal, setDetailModal] = useState({ open: false, billId: null });
  const [payModal, setPayModal] = useState({ open: false, bill: null });
  const [generateModal, setGenerateModal] = useState(false);
  const [annualModal, setAnnualModal] = useState(false);

  const fetchBills = () => {
    setLoading(true);
    const params = { ...filters, page, per_page: 25 };
    if (!params.status) delete params.status;
    if (!params.bill_type) delete params.bill_type;
    billApi.getBills(params)
      .then((res) => {
        setBills(res.data.data ?? []);
        setMeta(res.data.meta ?? { total: 0, last_page: 1 });
      })
      .finally(() => setLoading(false));
  };

  const setFilter = (k) => (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [k]: k === 'period_year' || k === 'period_month' ? Number(e.target.value) : e.target.value }));
  };

  useEffect(() => { fetchBills(); }, [filters, page]);

  // Compute stats from loaded bills
  const stats = useMemo(() => ({
    total: meta.total,
    paid: bills.filter((b) => b.status === 'paid').length,
    unpaid: bills.filter((b) => b.status === 'unpaid').length,
    partial: bills.filter((b) => b.status === 'partial').length,
  }), [bills, meta.total]);

  const openPay = (bill) => setPayModal({ open: true, bill });

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-md">
        <div>
          <h1 className="font-headline-md text-on-surface">Tagihan & Pembayaran</h1>
          <p className="text-body-sm text-on-surface-variant mt-xs">Kelola tagihan bulanan dan rekam pembayaran warga</p>
        </div>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={() => setAnnualModal(true)}>
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Bayar Tahunan
          </Button>
          <Button onClick={() => setGenerateModal(true)}>
            <span className="material-symbols-outlined text-lg">bolt</span>
            Generate
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
          value={filters.period_year}
          onChange={setFilter('period_year')}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filters.period_month}
          onChange={setFilter('period_month')}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={setFilter('status')}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="unpaid">Belum Bayar</option>
          <option value="partial">Sebagian</option>
          <option value="paid">Lunas</option>
        </select>
        <select
          value={filters.bill_type}
          onChange={setFilter('bill_type')}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          <option value="">Semua Jenis</option>
          <option value="security">Keamanan</option>
          <option value="cleaning">Kebersihan</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-md">
        {[
          { value: meta.total,                                          icon: 'receipt_long', color: 'text-on-surface',   bg: 'bg-surface-container', label: 'Total Tagihan' },
          { value: bills.filter((b) => b.status === 'paid').length,    icon: 'check_circle', color: 'text-primary',      bg: 'bg-primary/10',        label: 'Lunas' },
          { value: bills.filter((b) => b.status === 'unpaid').length,  icon: 'pending',      color: 'text-error',        bg: 'bg-error/10',          label: 'Belum Bayar' },
          { value: bills.filter((b) => b.status === 'partial').length, icon: 'timelapse',    color: 'text-amber-500',    bg: 'bg-amber-500/10',      label: 'Sebagian' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="glass-card rounded-xl px-md py-sm flex items-center gap-sm">
            <div className={`${bg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined ${color} text-lg`}>{icon}</span>
            </div>
            <div>
              <p className={`font-mono-data text-xl font-bold ${color}`}>{value}</p>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Rumah', 'Warga', 'Jenis', 'Tagihan', 'Terbayar', 'Sisa', 'Jatuh Tempo', 'Status', ''].map((h) => (
                <th key={h} className="px-lg py-md text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-xl">
                  <div className="flex items-center justify-center gap-md text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                    Memuat data...
                  </div>
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-xl">
                  <div className="flex flex-col items-center gap-sm text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-4xl">receipt_long</span>
                    <p className="text-body-sm">Tidak ada tagihan untuk periode ini</p>
                  </div>
                </td>
              </tr>
            ) : bills.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-primary/5 transition-colors cursor-pointer group"
                onClick={() => setDetailModal({ open: true, billId: b.id })}
              >
                <td className="px-lg py-md">
                  <span className="font-mono-data font-semibold text-on-surface">{b.house?.house_number ?? '—'}</span>
                </td>
                <td className="px-lg py-md text-on-surface-variant max-w-[140px] truncate">
                  {b.resident?.full_name ?? '—'}
                </td>
                <td className="px-lg py-md"><Badge value={b.bill_type} /></td>
                <td className="px-lg py-md font-mono-data text-on-surface whitespace-nowrap">{formatCurrency(b.amount)}</td>
                <td className="px-lg py-md font-mono-data text-primary whitespace-nowrap">{formatCurrency(b.total_paid)}</td>
                <td className="px-lg py-md font-mono-data text-error whitespace-nowrap">{formatCurrency(b.remaining)}</td>
                <td className="px-lg py-md text-on-surface-variant whitespace-nowrap">{formatDate(b.due_date)}</td>
                <td className="px-lg py-md"><Badge value={b.status} dot /></td>
                <td className="px-lg py-md text-right" onClick={(e) => e.stopPropagation()}>
                  {b.status !== 'paid' && (
                    <button
                      onClick={() => openPay(b)}
                      className="flex items-center gap-xs text-primary hover:opacity-80 transition-opacity text-body-sm font-medium opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-base">payments</span>
                      Bayar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-lg py-md border-t border-outline-variant/20 bg-surface-container-low/30">
            <p className="text-[12px] text-on-surface-variant">
              Menampilkan <span className="font-medium text-on-surface">{bills.length}</span> dari{' '}
              <span className="font-medium text-on-surface">{meta.total}</span> tagihan
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
      <GenerateModal open={generateModal} onClose={() => setGenerateModal(false)} onDone={fetchBills} />
      <AnnualPayModal open={annualModal} onClose={() => setAnnualModal(false)} onDone={fetchBills} />
      <BillDetailModal
        open={detailModal.open}
        billId={detailModal.billId}
        onClose={() => setDetailModal({ open: false, billId: null })}
        onPay={openPay}
      />
      <PaymentModal
        open={payModal.open}
        bill={payModal.bill}
        onClose={() => setPayModal({ open: false, bill: null })}
        onDone={fetchBills}
      />
    </div>
  );
}
