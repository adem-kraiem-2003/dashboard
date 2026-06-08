'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

type LoginStep = 'credentials' | 'totp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('credentials');

  // Credentials kept in state so the TOTP step can replay the full login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totpInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the TOTP field when the step changes
  useEffect(() => {
    if (step === 'totp') {
      totpInputRef.current?.focus();
    }
  }, [step]);

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? 'Email ou mot de passe incorrect');
      }

      if (data.requires2FA) {
        setStep('totp');
        return;
      }

      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, totpCode }),
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? 'Code 2FA invalide ou expiré');
      }

      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      setTotpCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfafa] dark:bg-[#1a1114] px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Nouri Fashion
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tableau de bord administrateur
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 p-8">
          {step === 'credentials' ? (
            <CredentialsForm
              email={email}
              password={password}
              loading={loading}
              error={error}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleCredentials}
            />
          ) : (
            <TotpForm
              code={totpCode}
              loading={loading}
              error={error}
              inputRef={totpInputRef}
              onCodeChange={setTotpCode}
              onSubmit={handleTotp}
              onBack={() => { setStep('credentials'); setError(null); setTotpCode(''); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Credentials step ────────────────────────────────────────────────────────

type CredentialsFormProps = {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
};

function CredentialsForm({
  email, password, loading, error,
  onEmailChange, onPasswordChange, onSubmit,
}: CredentialsFormProps) {
  return (
    <>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Connexion</h2>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email
          </label>
          <input
            data-testid="login-email"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40 focus:border-[#e2366a] transition"
            placeholder="admin@nouri-fashion.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mot de passe
          </label>
          <input
            data-testid="login-password"
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40 focus:border-[#e2366a] transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          data-testid="login-submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#e2366a] hover:bg-[#c82d5e] disabled:opacity-60 text-white font-bold text-sm transition-colors"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </>
  );
}

// ── TOTP step ───────────────────────────────────────────────────────────────

type TotpFormProps = {
  code: string;
  loading: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onCodeChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onBack: () => void;
};

function TotpForm({ code, loading, error, inputRef, onCodeChange, onSubmit, onBack }: TotpFormProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="size-10 bg-[#e2366a]/10 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheckIcon className="w-5 h-5 text-[#e2366a]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Vérification 2FA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ouvrez votre application d&apos;authentification
          </p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="totp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Code à 6 chiffres
          </label>
          <input
            ref={inputRef}
            data-testid="login-totp"
            id="totp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-2xl font-mono tracking-[0.5em] text-center placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40 focus:border-[#e2366a] transition"
            placeholder="000000"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Le code change toutes les 30 secondes
          </p>
        </div>

        <button
          type="submit"
          data-testid="login-totp-submit"
          disabled={loading || code.length !== 6}
          className="w-full py-2.5 px-4 rounded-xl bg-[#e2366a] hover:bg-[#c82d5e] disabled:opacity-60 text-white font-bold text-sm transition-colors"
        >
          {loading ? 'Vérification…' : 'Vérifier le code'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Retour à la connexion
        </button>
      </form>
    </>
  );
}

// ── Shared ──────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      data-testid="login-error"
      className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
    >
      {message}
    </div>
  );
}
