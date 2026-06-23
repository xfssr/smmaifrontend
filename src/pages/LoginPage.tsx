import React, { useState } from 'react';
import { AlertCircle, Loader2, LogIn } from 'lucide-react';
import { api } from '../lib/api';

type LoginPageProps = {
  onAuthenticated: (account: any) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = login.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await api.login(login, password);
      const account = await api.me();
      onAuthenticated(account);
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid login or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[68vh] w-full max-w-md items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-5 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30"
      >
        <header className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-orange">SMMAI</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">Sign in</h1>
        </header>

        <label className="block space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Login</span>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            autoComplete="username"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-orange/70"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-orange/70"
          />
        </label>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red/20 bg-red-500/5 px-4 py-3 text-sm text-red">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          <span>Sign in</span>
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
