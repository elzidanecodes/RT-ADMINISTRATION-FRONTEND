import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/authApi';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.data.user, res.data.data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-on-surface font-body-main">
      {/* Left — Architectural Visual */}
      <section className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/80" />

        {/* Branding */}
        <div className="relative z-10 flex items-center gap-sm">
          <img src={logo} alt="RT Admin" className="w-12 h-12 drop-shadow-2xl" />
          <div>
            <h1 className="font-display-lg text-headline-md text-white leading-tight">RT Admin</h1>
            <p className="font-label-caps text-primary tracking-widest text-[10px]">SISTEM MANAJEMEN</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display-lg text-display-lg text-white mb-md leading-[1.1]">
            Kelola RT.<br />
            <span className="text-gradient">Lebih Mudah.</span>
          </h2>
          <p className="text-white/70 text-body-main leading-relaxed mb-xl">
            Sistem administrasi RT yang profesional untuk pengelolaan hunian, iuran warga, dan laporan keuangan secara real-time.
          </p>
          <div className="flex gap-lg">
            {[['Aman', 'Enkripsi'], ['99.9%', 'Uptime'], ['Real-time', 'Pemantauan']].map(([val, lbl]) => (
              <div key={lbl} className="flex flex-col gap-xs">
                <span className="text-primary font-display-lg text-headline-md">{val}</span>
                <span className="text-body-sm text-white/50 font-label-caps uppercase">{lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tag */}
        <div className="relative z-10 flex items-center gap-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-body-sm text-white/70 font-mono-data">Lingkungan: Produksi</span>
        </div>
      </section>

      {/* Right — Login Form */}
      <section className="w-full lg:w-[40%] flex flex-col justify-center items-center px-lg bg-surface relative z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <div className="lg:hidden flex flex-col items-center mb-xl">
            <img src={logo} alt="RT Admin" className="w-16 h-16 mb-md drop-shadow-xl" />
            <h1 className="font-display-lg text-headline-md text-primary">RT Admin</h1>
            <p className="font-label-caps text-on-surface-variant tracking-widest text-[11px]">SISTEM MANAJEMEN</p>
          </div>

          <div className="mb-xl text-center lg:text-left">
            <h2 className="font-display-lg text-headline-md text-on-surface mb-xs">Selamat Datang</h2>
            <p className="text-on-surface-variant text-body-sm">Masuk ke dasbor administrasi RT</p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-xl rounded-[2rem] shadow-2xl">
            {error && (
              <div className="mb-lg px-md py-sm bg-error/10 border border-error/20 rounded-xl text-body-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Email */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block">Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">alternate_email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@rt-perumahan.com"
                    required
                    className="input-dark w-full h-14 pl-[52px] pr-md"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-lg">lock</span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••••••"
                    required
                    className="input-dark w-full h-14 pl-[52px] pr-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-on-primary font-semibold rounded-xl flex items-center justify-center gap-sm transition-all primary-glow active:scale-[0.99] shadow-lg shadow-primary/10 disabled:opacity-60"
              >
                {loading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <>
                    <span>Masuk</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward_ios</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-xl text-center">
            <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-container-high border border-outline-variant/10 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="text-[10px] text-on-surface-variant font-label-caps uppercase tracking-widest">TLS 1.3 Terenkripsi</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
