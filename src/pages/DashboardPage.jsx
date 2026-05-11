import { useEffect, useState } from 'react';
import { getDashboard, getAnnualChart } from '../api/reportApi';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../context/ThemeContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-md py-sm rounded-xl text-body-sm">
      <p className="text-on-surface-variant font-label-caps uppercase text-[10px] mb-xs">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono-data">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, badge, badgeColor = 'text-primary bg-primary/10' }) {
  return (
    <div className="glass-card p-md rounded-xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-sm">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</span>
        {badge && (
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-headline-md font-mono-data text-on-surface">{value}</span>
        {sub && <span className="text-body-sm text-on-surface-variant/70">{sub}</span>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { isDark } = useTheme();
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const year = new Date().getFullYear();

  const gridColor   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(11,28,48,0.07)';
  const axisColor   = isDark ? '#86948a' : '#6c7a71';
  const legendColor = isDark ? '#bbcabf' : '#3c4a42';

  useEffect(() => {
    getDashboard()
      .then((res) => setSummary(res.data.data))
      .finally(() => setLoadingSummary(false));

    getAnnualChart(year)
      .then((res) => setChart(res.data.data?.monthly ?? []))
      .finally(() => setLoadingChart(false));
  }, []);

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-md text-on-surface">Dashboard Overview</h2>
          <p className="text-on-surface-variant text-body-sm">
            {summary?.current_month ?? '—'} — status administrasi RT secara real-time
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-md">
        <StatCard
          label="Dihuni"
          value={loadingSummary ? '—' : summary?.occupied_houses}
          sub="Rumah"
          badge={summary ? `${Math.round((summary.occupied_houses / (summary.occupied_houses + summary.vacant_houses)) * 100) || 0}%` : null}
        />
        <StatCard label="Kosong" value={loadingSummary ? '—' : summary?.vacant_houses} sub="Rumah" />
        <StatCard
          label="Pemasukan"
          value={loadingSummary ? '—' : formatCurrency(summary?.this_month.income)}
          sub="Bulan ini"
        />
        <StatCard
          label="Pengeluaran"
          value={loadingSummary ? '—' : formatCurrency(summary?.this_month.expense)}
          sub="Operasional"
        />
        <StatCard
          label="Saldo"
          value={loadingSummary ? '—' : formatCurrency(summary?.this_month.balance)}
          sub="Bulan ini"
        />
        <StatCard
          label="Tunggakan"
          value={loadingSummary ? '—' : summary?.unpaid_bills_count}
          sub="Tagihan"
          badge={summary?.unpaid_bills_count > 0 ? 'Perlu Tindakan' : null}
          badgeColor="text-error bg-error/10"
        />
      </div>

      {/* Chart */}
      <div className="glass-card rounded-xl p-lg">
        <div className="flex justify-between items-center mb-lg">
          <h3 className="font-headline-md text-on-surface">Analitik Keuangan {year}</h3>
        </div>
        {loadingChart ? (
          <div className="h-[280px] flex items-center justify-center gap-md text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
            <span className="text-body-sm">Memuat grafik...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chart} margin={{ top: 0, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4edea3" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#4edea3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fc7c78" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#fc7c78" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} width={60}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: legendColor }} />
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#4edea3" strokeWidth={2.5}
                fill="url(#incomeGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#fc7c78" strokeWidth={2}
                strokeDasharray="6 3" fill="url(#expenseGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Unpaid summary */}
      {summary && summary.unpaid_bills_count > 0 && (
        <div className="glass-card rounded-xl p-lg flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
            <div>
              <p className="font-semibold text-body-sm text-on-surface">
                {summary.unpaid_bills_count} tagihan belum dilunasi
              </p>
              <p className="text-on-surface-variant text-body-sm">
                Total tunggakan: <span className="text-error font-mono-data font-semibold">{formatCurrency(summary.unpaid_bills_total)}</span>
              </p>
            </div>
          </div>
          <a href="/bills" className="px-md py-sm border border-outline-variant/30 rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
            Lihat Tagihan
          </a>
        </div>
      )}
    </div>
  );
}
