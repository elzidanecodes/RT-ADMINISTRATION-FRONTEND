import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as authApi from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await authApi.logout(); } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-256px)] flex justify-between items-center px-lg h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 dark:border-transparent dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] z-40">
      <div className="flex items-center bg-surface-container-low px-md py-1.5 rounded-full border border-outline-variant/20 dark:border-transparent w-96">
        <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
        <input
          className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-sm w-full ml-sm placeholder:text-on-surface-variant/50 text-on-surface"
          placeholder="Cari rumah, warga, atau transaksi..."
        />
      </div>

      <div className="flex items-center gap-lg">
        <button className="relative text-on-surface-variant hover:text-primary transition-all duration-150">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <button
          onClick={toggle}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        <div className="h-8 w-px bg-outline-variant/30" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-xs text-on-surface-variant hover:text-error transition-colors text-body-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}
