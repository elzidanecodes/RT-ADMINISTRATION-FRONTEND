import { useEffect, useState } from 'react';
import * as reportApi from '../api/reportApi';
import { formatCurrency, formatDate, MONTHS } from '../utils/format';
import { useTheme } from '../context/ThemeContext';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const CHART_GREEN  = '#4edea3';
const CHART_RED    = '#fc7c78';
const CHART_YELLOW = '#fbbf24';

// ─── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-md py-sm rounded-xl text-body-sm min-w-[160px] shadow-lg">
      <p className="text-on-surface-variant font-label-caps text-[10px] uppercase mb-sm border-b border-outline-variant/20 pb-xs">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-on-surface-variant text-[11px]">{p.name}</span>
          </div>
          <span className="font-mono-data text-[11px]" style={{ color: p.color }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg, subtitle }) {
  return (
    <div className="glass-card rounded-xl p-lg flex items-start gap-md">
      <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
        <span className={`material-symbols-outlined ${color} text-2xl`}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className={`font-mono-data text-2xl font-bold mt-xs ${color}`}>{formatCurrency(value)}</p>
        {subtitle && <p className="text-[11px] text-on-surface-variant/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-xl gap-md text-on-surface-variant">
      <span className="material-symbols-outlined animate-spin text-primary text-2xl">progress_activity</span>
      <span className="text-body-sm">Memuat data laporan...</span>
    </div>
  );
}

// ─── Annual Tab ────────────────────────────────────────────────────────────────
function AnnualTab({ year }) {
  const { isDark } = useTheme();
  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(11,28,48,0.07)';
  const axisStyle  = { fontSize: 11, fill: isDark ? '#86948a' : '#6c7a71' };
  const cursorFill = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(11,28,48,0.04)';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);
    reportApi.getAnnualChart(year)
      .then((res) => setData(res.data.data))
      .catch(() => setError('Gagal memuat data tahunan.'))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingState />;
  if (error) return (
    <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-lg py-md">
      <span className="material-symbols-outlined text-error">error</span>
      <p className="text-body-sm text-error">{error}</p>
    </div>
  );
  if (!data) return null;

  const { summary, monthly } = data;
  const hasData = monthly.some((m) => m.income > 0 || m.expense > 0);

  return (
    <div className="space-y-lg">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        <StatCard
          label="Total Pemasukan"
          value={summary.total_income}
          icon="arrow_circle_up"
          color="text-primary"
          bg="bg-primary/10"
          subtitle={`Tahun ${year}`}
        />
        <StatCard
          label="Total Pengeluaran"
          value={summary.total_expense}
          icon="arrow_circle_down"
          color="text-error"
          bg="bg-error/10"
          subtitle={`Tahun ${year}`}
        />
        <StatCard
          label="Saldo Tahunan"
          value={summary.balance}
          icon={summary.balance >= 0 ? 'account_balance_wallet' : 'warning'}
          color={summary.balance >= 0 ? 'text-primary' : 'text-error'}
          bg={summary.balance >= 0 ? 'bg-primary/10' : 'bg-error/10'}
          subtitle={summary.balance >= 0 ? 'Surplus' : 'Defisit'}
        />
      </div>

      {!hasData ? (
        <div className="glass-card rounded-xl p-xl flex flex-col items-center gap-md text-on-surface-variant/60">
          <span className="material-symbols-outlined text-4xl">bar_chart</span>
          <p className="text-body-sm">Belum ada transaksi pada tahun {year}</p>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="glass-card rounded-xl p-lg">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-semibold text-on-surface">Pemasukan vs Pengeluaran per Bulan</h3>
              <div className="flex items-center gap-md text-[11px]">
                <span className="flex items-center gap-xs"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: CHART_GREEN }} />Pemasukan</span>
                <span className="flex items-center gap-xs text-on-surface-variant"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: CHART_RED }} />Pengeluaran</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month_name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
                <Bar dataKey="income" name="Pemasukan" fill={CHART_GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expense" name="Pengeluaran" fill={CHART_RED} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="glass-card rounded-xl p-lg">
            <h3 className="font-semibold text-on-surface mb-lg">Saldo Kumulatif</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_GREEN} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_GREEN} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month_name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}jt` : `${(v / 1_000).toFixed(0)}rb`}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_GREEN, strokeWidth: 1, strokeDasharray: '4 2' }} />
                <Area
                  type="monotone"
                  dataKey="running_balance"
                  name="Saldo"
                  stroke={CHART_GREEN}
                  strokeWidth={2.5}
                  fill="url(#balGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: CHART_GREEN, stroke: 'var(--color-surface)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-lg py-md border-b border-outline-variant/20">
              <h3 className="font-semibold text-on-surface">Ringkasan per Bulan</h3>
            </div>
            <table className="w-full text-body-sm">
              <thead className="bg-surface-container-low/50">
                <tr>
                  {['Bulan', 'Pemasukan', 'Pengeluaran', 'Saldo Bulan', 'Saldo Kumulatif'].map((h) => (
                    <th key={h} className="px-lg py-sm text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {monthly.map((m) => (
                  <tr key={m.month} className="hover:bg-primary/5 transition-colors">
                    <td className="px-lg py-sm font-medium text-on-surface">{m.month_name}</td>
                    <td className="px-lg py-sm font-mono-data text-primary">{formatCurrency(m.income)}</td>
                    <td className="px-lg py-sm font-mono-data text-error">{formatCurrency(m.expense)}</td>
                    <td className="px-lg py-sm font-mono-data">
                      <span className={m.balance >= 0 ? 'text-primary' : 'text-error'}>{formatCurrency(m.balance)}</span>
                    </td>
                    <td className="px-lg py-sm font-mono-data">
                      <span className={m.running_balance >= 0 ? 'text-on-surface' : 'text-error'}>{formatCurrency(m.running_balance)}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-container-low/60 font-semibold">
                  <td className="px-lg py-sm text-on-surface">Total</td>
                  <td className="px-lg py-sm font-mono-data text-primary">{formatCurrency(summary.total_income)}</td>
                  <td className="px-lg py-sm font-mono-data text-error">{formatCurrency(summary.total_expense)}</td>
                  <td className="px-lg py-sm font-mono-data">
                    <span className={summary.balance >= 0 ? 'text-primary' : 'text-error'}>{formatCurrency(summary.balance)}</span>
                  </td>
                  <td className="px-lg py-sm" />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Monthly Tab ───────────────────────────────────────────────────────────────
function MonthlyTab({ year, month }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);
    reportApi.getMonthlyDetail(year, month)
      .then((res) => setData(res.data.data))
      .catch(() => setError('Gagal memuat data bulanan.'))
      .finally(() => setLoading(false));
  }, [year, month]);

  if (loading) return <LoadingState />;
  if (error) return (
    <div className="flex items-center gap-sm bg-error/10 border border-error/20 rounded-xl px-lg py-md">
      <span className="material-symbols-outlined text-error">error</span>
      <p className="text-body-sm text-error">{error}</p>
    </div>
  );
  if (!data) return null;

  const { income, expense, balance, period } = data;
  const totalPayments = income.payments.length;
  const incomeByType = [
    { label: 'Keamanan', value: income.by_type.security, icon: 'security', color: 'text-primary' },
    { label: 'Kebersihan', value: income.by_type.cleaning, icon: 'cleaning_services', color: 'text-secondary' },
  ];

  return (
    <div className="space-y-lg">
      {/* Period Label */}
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
        <h2 className="font-semibold text-on-surface">{period}</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        <StatCard
          label="Total Pemasukan"
          value={income.total}
          icon="arrow_circle_up"
          color="text-primary"
          bg="bg-primary/10"
          subtitle={`${totalPayments} pembayaran tercatat`}
        />
        <StatCard
          label="Total Pengeluaran"
          value={expense.total}
          icon="arrow_circle_down"
          color="text-error"
          bg="bg-error/10"
          subtitle={`${expense.items.length} transaksi`}
        />
        <StatCard
          label="Saldo Bulan Ini"
          value={balance}
          icon={balance >= 0 ? 'account_balance_wallet' : 'warning'}
          color={balance >= 0 ? 'text-primary' : 'text-error'}
          bg={balance >= 0 ? 'bg-primary/10' : 'bg-error/10'}
          subtitle={balance >= 0 ? 'Surplus' : 'Defisit'}
        />
      </div>

      {/* Income + Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Income by type */}
        <div className="glass-card rounded-xl p-lg">
          <h3 className="font-semibold text-on-surface mb-md">Pemasukan per Jenis</h3>
          <div className="space-y-sm">
            {incomeByType.map(({ label, value, icon, color }) => {
              const pct = income.total > 0 ? Math.round((value / income.total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-xs">
                    <div className="flex items-center gap-sm">
                      <span className={`material-symbols-outlined ${color} text-base`}>{icon}</span>
                      <span className="text-body-sm text-on-surface-variant">{label}</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <span className={`font-mono-data text-sm font-semibold ${color}`}>{formatCurrency(value)}</span>
                      <span className="font-label-caps text-[10px] text-on-surface-variant/50 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color === 'text-primary' ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense by category */}
        <div className="glass-card rounded-xl p-lg">
          <h3 className="font-semibold text-on-surface mb-md">Pengeluaran per Kategori</h3>
          {expense.by_category.length === 0 ? (
            <div className="flex items-center gap-md text-on-surface-variant/60 py-md">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
              <p className="text-body-sm">Belum ada pengeluaran</p>
            </div>
          ) : (
            <div className="space-y-sm">
              {expense.by_category.map(({ category, total }) => {
                const pct = expense.total > 0 ? Math.round((total / expense.total) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-xs">
                      <span className="text-body-sm text-on-surface-variant">{category ?? 'Lain-lain'}</span>
                      <div className="flex items-center gap-sm">
                        <span className="font-mono-data text-sm font-semibold text-error">{formatCurrency(total)}</span>
                        <span className="font-label-caps text-[10px] text-on-surface-variant/50 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-error rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Income Detail Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Detail Pembayaran</h3>
          <span className="font-label-caps text-[11px] text-on-surface-variant bg-surface-container px-sm py-0.5 rounded-full">
            {income.payments.length} transaksi
          </span>
        </div>
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Rumah', 'Warga', 'Jenis', 'Jumlah', 'Tanggal'].map((h) => (
                <th key={h} className="px-lg py-sm text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {income.payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-lg py-lg text-center text-on-surface-variant/60 text-body-sm">
                  Belum ada pembayaran pada periode ini
                </td>
              </tr>
            ) : income.payments.map((p) => (
              <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-lg py-sm font-mono-data font-semibold text-on-surface">{p.house_number ?? '—'}</td>
                <td className="px-lg py-sm text-on-surface-variant">{p.resident_name ?? '—'}</td>
                <td className="px-lg py-sm">
                  <span className={`font-label-caps text-[10px] uppercase px-sm py-0.5 rounded-full ${
                    p.bill_type === 'security' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {p.bill_type === 'security' ? 'Keamanan' : 'Kebersihan'}
                  </span>
                </td>
                <td className="px-lg py-sm font-mono-data text-primary whitespace-nowrap">{formatCurrency(p.amount_paid)}</td>
                <td className="px-lg py-sm text-on-surface-variant whitespace-nowrap">{formatDate(p.payment_date)}</td>
              </tr>
            ))}
          </tbody>
          {income.payments.length > 0 && (
            <tfoot className="bg-surface-container-low/60 border-t border-outline-variant/20">
              <tr>
                <td colSpan={3} className="px-lg py-sm text-body-sm font-semibold text-on-surface">Total</td>
                <td className="px-lg py-sm font-mono-data font-bold text-primary">{formatCurrency(income.total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Expense Detail Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-lg py-md border-b border-outline-variant/20 flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Detail Pengeluaran</h3>
          <span className="font-label-caps text-[11px] text-on-surface-variant bg-surface-container px-sm py-0.5 rounded-full">
            {expense.items.length} transaksi
          </span>
        </div>
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container-low/50">
            <tr>
              {['Judul', 'Kategori', 'Jumlah', 'Tanggal'].map((h) => (
                <th key={h} className="px-lg py-sm text-left font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {expense.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-lg py-lg text-center text-on-surface-variant/60 text-body-sm">
                  Belum ada pengeluaran pada periode ini
                </td>
              </tr>
            ) : expense.items.map((e) => (
              <tr key={e.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-lg py-sm font-medium text-on-surface">{e.title}</td>
                <td className="px-lg py-sm text-on-surface-variant">{e.category ?? '—'}</td>
                <td className="px-lg py-sm font-mono-data text-error whitespace-nowrap">{formatCurrency(e.amount)}</td>
                <td className="px-lg py-sm text-on-surface-variant whitespace-nowrap">{formatDate(e.expense_date)}</td>
              </tr>
            ))}
          </tbody>
          {expense.items.length > 0 && (
            <tfoot className="bg-surface-container-low/60 border-t border-outline-variant/20">
              <tr>
                <td colSpan={2} className="px-lg py-sm text-body-sm font-semibold text-on-surface">Total</td>
                <td className="px-lg py-sm font-mono-data font-bold text-error">{formatCurrency(expense.total)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [tab, setTab] = useState('annual');
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div>
        <h1 className="font-headline-md text-on-surface">Laporan Keuangan</h1>
        <p className="text-body-sm text-on-surface-variant mt-xs">Analitik pemasukan, pengeluaran, dan saldo RT</p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-md flex-wrap">
        {/* Tab Switcher */}
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          {[
            ['annual',  'bar_chart',      'Tahunan'],
            ['monthly', 'calendar_today', 'Bulanan'],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-xs px-md py-1.5 text-body-sm font-medium rounded-lg transition-all duration-150 ${
                tab === key
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Year Selector */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Month Selector (monthly tab only) */}
        {tab === 'monthly' && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="input-dark px-md py-1.5 text-body-sm rounded-full cursor-pointer"
          >
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        )}
      </div>

      {/* Tab Content */}
      {tab === 'annual'
        ? <AnnualTab year={year} />
        : <MonthlyTab year={year} month={month} />
      }
    </div>
  );
}
