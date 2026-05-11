import { useTheme } from '../../context/ThemeContext';

const lightStyles = {
  paid:      'bg-emerald-100 text-emerald-700',
  unpaid:    'bg-red-100 text-red-600',
  partial:   'bg-amber-100 text-amber-700',
  occupied:  'bg-emerald-100 text-emerald-700',
  vacant:    'bg-slate-100 text-slate-500',
  active:    'bg-emerald-100 text-emerald-700',
  inactive:  'bg-slate-100 text-slate-500',
  security:  'bg-indigo-100 text-indigo-600',
  cleaning:  'bg-emerald-100 text-emerald-700',
  permanent: 'bg-emerald-100 text-emerald-700',
  contract:  'bg-amber-100 text-amber-700',
  rental:    'bg-sky-100 text-sky-600',
  owner:     'bg-emerald-100 text-emerald-700',
  tenant:    'bg-sky-100 text-sky-600',
};

const darkStyles = {
  paid:      'bg-primary/10 text-primary',
  unpaid:    'bg-error/10 text-error',
  partial:   'bg-amber-500/10 text-amber-400',
  occupied:  'bg-primary/10 text-primary',
  vacant:    'bg-surface-container-high text-on-surface-variant',
  active:    'bg-primary/10 text-primary',
  inactive:  'bg-surface-container-high text-on-surface-variant',
  security:  'bg-tertiary/10 text-tertiary',
  cleaning:  'bg-primary/10 text-primary',
  permanent: 'bg-primary/10 text-primary',
  contract:  'bg-amber-500/10 text-amber-400',
  rental:    'bg-secondary/10 text-secondary',
  owner:     'bg-primary/10 text-primary',
  tenant:    'bg-secondary/10 text-secondary',
};

const labels = {
  paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Sebagian',
  occupied: 'Dihuni', vacant: 'Kosong', active: 'Aktif', inactive: 'Tidak Aktif',
  security: 'Keamanan', cleaning: 'Kebersihan',
  permanent: 'Tetap', contract: 'Kontrak', rental: 'Sewa',
  owner: 'Pemilik', tenant: 'Penyewa',
};

export default function Badge({ value, dot = false }) {
  const { isDark } = useTheme();
  const key = value?.toLowerCase();
  const styleMap = isDark ? darkStyles : lightStyles;
  const cls = styleMap[key] ?? (isDark
    ? 'bg-surface-container text-on-surface-variant'
    : 'bg-slate-100 text-slate-600'
  );

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase tracking-wider ${cls}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0 opacity-75" style={{ background: 'currentColor' }} />}
      {labels[key] ?? value}
    </span>
  );
}
