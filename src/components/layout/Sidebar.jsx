import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const navItems = [
  { to: '/',         label: 'Dashboard',  icon: 'dashboard',    end: true },
  { to: '/houses',   label: 'Rumah',      icon: 'home' },
  { to: '/residents',label: 'Warga',      icon: 'group' },
  { to: '/bills',    label: 'Tagihan',    icon: 'receipt_long' },
  { to: '/expenses', label: 'Pengeluaran',icon: 'payments' },
  { to: '/reports',  label: 'Laporan',    icon: 'analytics' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/30 dark:border-transparent flex flex-col py-md px-sm z-50 shadow-sm dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
      <div className="mb-xl px-md flex items-center gap-sm">
        <img src={logo} alt="RT Admin Logo" className="w-10 h-10 shrink-0" />
        <div>
          <h1 className="font-display-lg text-headline-md text-primary tracking-tight leading-none">RT Admin</h1>
          <p className="text-on-surface-variant text-[11px] opacity-70 mt-0.5">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-xs">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-md px-md py-sm text-body-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-primary/5'
                  : 'text-on-surface-variant hover:bg-surface-container-high rounded'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-primary/[0.15]'
                    : 'bg-surface-container-high/70 group-hover:bg-surface-container-high'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-md py-md bg-surface-container-low rounded-xl">
        <div className="flex items-center gap-sm">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-base">person</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-body-sm font-bold text-on-surface truncate">{user?.name ?? 'Admin'}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Super Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
