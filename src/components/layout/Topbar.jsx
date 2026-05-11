import { useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <span className="text-sm text-gray-500">Sistem Administrasi RT</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
