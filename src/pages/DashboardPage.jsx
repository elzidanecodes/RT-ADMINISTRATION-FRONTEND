import { useEffect, useState } from 'react';
import { getDashboard } from '../api/reportApi';
import { formatCurrency } from '../utils/format';
import {
  BuildingOffice2Icon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

function StatCard({ icon: Icon, label, value, color = 'text-indigo-600', bg = 'bg-indigo-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Memuat data...</div>;
  }

  if (!data) {
    return <div className="text-sm text-red-500">Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Periode: {data.current_month}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BuildingOffice2Icon} label="Rumah Dihuni" value={data.occupied_houses} bg="bg-blue-50" color="text-blue-600" />
        <StatCard icon={BuildingOffice2Icon} label="Rumah Kosong" value={data.vacant_houses} bg="bg-gray-100" color="text-gray-500" />
        <StatCard icon={UsersIcon} label="Total Warga" value={data.total_residents} bg="bg-purple-50" color="text-purple-600" />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Tagihan Belum Bayar"
          value={data.unpaid_bills_count}
          bg="bg-red-50"
          color="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-gray-500">Pemasukan Bulan Ini</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(data.this_month.income)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
            <p className="text-xs font-medium text-gray-500">Pengeluaran Bulan Ini</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.this_month.expense)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 mb-1">Saldo Bulan Ini</p>
          <p className={`text-2xl font-bold ${data.this_month.balance >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
            {formatCurrency(data.this_month.balance)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Total Tunggakan</p>
        <p className="text-xl font-bold text-orange-600">{formatCurrency(data.unpaid_bills_total)}</p>
        <p className="text-xs text-gray-400 mt-0.5">dari {data.unpaid_bills_count} tagihan belum lunas</p>
      </div>
    </div>
  );
}
