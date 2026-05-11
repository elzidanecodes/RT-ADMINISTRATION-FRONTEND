import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/houses', label: 'Rumah', icon: BuildingOffice2Icon },
  { to: '/residents', label: 'Warga', icon: UsersIcon },
  { to: '/bills', label: 'Tagihan & Bayar', icon: CreditCardIcon },
  { to: '/expenses', label: 'Pengeluaran', icon: BanknotesIcon },
  { to: '/reports', label: 'Laporan', icon: ChartBarIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold tracking-wide">RT Administration</h1>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
