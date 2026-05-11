import { useEffect, useState } from 'react';
import * as reportApi from '../api/reportApi';
import { formatCurrency, MONTHS } from '../utils/format';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const toMillion = (v) => `${(v / 1_000_000).toFixed(1)}jt`;

function SummaryCard({ label, value, colorClass }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${colorClass}`}>{formatCurrency(value)}</p>
    </div>
  );
}

function AnnualTab({ year }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportApi.getAnnualChart(year)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <p className="text-sm text-gray-400">Memuat data tahunan...</p>;
  if (!data) return <p className="text-sm text-red-500">Gagal memuat.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Pemasukan" value={data.summary.total_income} colorClass="text-green-700" />
        <SummaryCard label="Total Pengeluaran" value={data.summary.total_expense} colorClass="text-red-600" />
        <SummaryCard label="Saldo Tahun Ini" value={data.summary.balance} colorClass={data.summary.balance >= 0 ? 'text-indigo-700' : 'text-red-600'} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Pemasukan vs Pengeluaran (per Bulan)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.monthly} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={toMillion} tick={{ fontSize: 11 }} width={55} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="income" name="Pemasukan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Saldo Kumulatif</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data.monthly} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month_name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={toMillion} tick={{ fontSize: 11 }} width={55} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Line type="monotone" dataKey="running_balance" name="Saldo" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MonthlyTab({ year, month }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    reportApi.getMonthlyDetail(year, month)
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [year, month]);

  if (loading) return <p className="text-sm text-gray-400">Memuat data bulanan...</p>;
  if (!data) return <p className="text-sm text-red-500">Gagal memuat.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Pemasukan" value={data.income.total} colorClass="text-green-700" />
        <SummaryCard label="Pengeluaran" value={data.expense.total} colorClass="text-red-600" />
        <SummaryCard label="Saldo" value={data.balance} colorClass={data.balance >= 0 ? 'text-indigo-700' : 'text-red-600'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pemasukan per Jenis</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Keamanan</span><span className="font-medium">{formatCurrency(data.income.by_type.security)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kebersihan</span><span className="font-medium">{formatCurrency(data.income.by_type.cleaning)}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pengeluaran per Kategori</h3>
          <div className="space-y-2 text-sm">
            {data.expense.by_category.length === 0 ? (
              <p className="text-gray-400">-</p>
            ) : data.expense.by_category.map((c) => (
              <div key={c.category} className="flex justify-between">
                <span className="text-gray-500">{c.category}</span>
                <span className="font-medium">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-700 px-5 py-3 border-b border-gray-100">Detail Pembayaran</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Rumah</th>
              <th className="px-4 py-2 text-left">Warga</th>
              <th className="px-4 py-2 text-left">Jenis</th>
              <th className="px-4 py-2 text-right">Jumlah</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.income.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">{p.house_number}</td>
                <td className="px-4 py-2 text-gray-600">{p.resident_name}</td>
                <td className="px-4 py-2 text-gray-500">{p.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'}</td>
                <td className="px-4 py-2 text-right text-green-700">{formatCurrency(p.amount_paid)}</td>
                <td className="px-4 py-2 text-gray-500">{p.payment_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-700 px-5 py-3 border-b border-gray-100">Detail Pengeluaran</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Kategori</th>
              <th className="px-4 py-2 text-right">Jumlah</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.expense.items.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2">{e.title}</td>
                <td className="px-4 py-2 text-gray-500">{e.category}</td>
                <td className="px-4 py-2 text-right text-red-600">{formatCurrency(e.amount)}</td>
                <td className="px-4 py-2 text-gray-500">{e.expense_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState('annual');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Laporan Keuangan</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setTab('annual')}
            className={`px-4 py-2 text-sm font-medium ${tab === 'annual' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Tahunan
          </button>
          <button
            onClick={() => setTab('monthly')}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-200 ${tab === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Bulanan
          </button>
        </div>

        <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </Select>

        {tab === 'monthly' && (
          <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </Select>
        )}
      </div>

      {tab === 'annual' ? <AnnualTab year={year} /> : <MonthlyTab year={year} month={month} />}
    </div>
  );
}
