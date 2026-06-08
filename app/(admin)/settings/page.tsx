'use client';

import { useState, useEffect, type FormEvent } from 'react';
import {
  ShieldCheckIcon,
  ShieldExclamationIcon,
  QrCodeIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

type AdminProfile = {
  id: number;
  email: string;
  role: string;
  totpEnabled: boolean;
};

type SetupData = {
  qrCode: string;
  otpauthUri: string;
};

type PageState =
  | { kind: 'loading' }
  | { kind: 'idle'; profile: AdminProfile }
  | { kind: 'setup-pending'; profile: AdminProfile; setup: SetupData }
  | { kind: 'enable-success'; profile: AdminProfile }
  | { kind: 'disable-pending'; profile: AdminProfile }
  | { kind: 'disable-success'; profile: AdminProfile }
  | { kind: 'error'; message: string };

export default function SettingsPage() {
  const [state, setState] = useState<PageState>({ kind: 'loading' });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setState({ kind: 'loading' });
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Non authentifié');
      const profile: AdminProfile = await res.json();
      setState({ kind: 'idle', profile });
    } catch {
      setState({ kind: 'error', message: 'Impossible de charger le profil. Reconnectez-vous.' });
    }
  }

  if (state.kind === 'loading') return <PageShell><LoadingCard /></PageShell>;
  if (state.kind === 'error') return <PageShell><ErrorCard message={state.message} onRetry={fetchProfile} /></PageShell>;

  const profile = 'profile' in state ? state.profile : null;
  if (!profile) return null;

  return (
    <PageShell>
      {/* Profile card */}
      <ProfileCard profile={profile} />

      {/* 2FA card */}
      {state.kind === 'idle' && !profile.totpEnabled && (
        <TwoFaDisabledCard
          onSetup={async () => {
            try {
              const res = await fetch('/api/auth/2fa/setup', { credentials: 'include' });
              if (!res.ok) throw new Error('Erreur lors de la génération du QR code');
              const setup: SetupData = await res.json();
              setState({ kind: 'setup-pending', profile, setup });
            } catch (err) {
              setState({ kind: 'error', message: err instanceof Error ? err.message : 'Erreur' });
            }
          }}
        />
      )}

      {state.kind === 'setup-pending' && (
        <SetupCard
          setup={state.setup}
          onConfirm={async (code) => {
            const res = await fetch('/api/auth/2fa/enable', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code }),
              credentials: 'include',
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              throw new Error(d?.message ?? 'Code invalide');
            }
            setState({ kind: 'enable-success', profile: { ...profile, totpEnabled: true } });
          }}
          onCancel={() => setState({ kind: 'idle', profile })}
        />
      )}

      {state.kind === 'enable-success' && (
        <SuccessBanner
          title="2FA activée avec succès"
          message="Votre compte est maintenant protégé. Toutes les sessions ont été invalidées — reconnectez-vous."
          onDismiss={() => setState({ kind: 'idle', profile: state.profile })}
        />
      )}

      {state.kind === 'idle' && profile.totpEnabled && (
        <TwoFaEnabledCard
          onDisableClick={() => setState({ kind: 'disable-pending', profile })}
        />
      )}

      {state.kind === 'disable-pending' && (
        <DisableCard
          onConfirm={async (password) => {
            const res = await fetch('/api/auth/2fa/disable', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password }),
              credentials: 'include',
            });
            if (!res.ok) {
              const d = await res.json().catch(() => ({}));
              throw new Error(d?.message ?? 'Mot de passe incorrect');
            }
            setState({ kind: 'disable-success', profile: { ...profile, totpEnabled: false } });
          }}
          onCancel={() => setState({ kind: 'idle', profile })}
        />
      )}

      {state.kind === 'disable-success' && (
        <SuccessBanner
          title="2FA désactivée"
          message="La double authentification a été retirée. Toutes les sessions ont été invalidées."
          onDismiss={() => setState({ kind: 'idle', profile: state.profile })}
        />
      )}
    </PageShell>
  );
}

// ── Layout ──────────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#120d0f] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Paramètres</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez votre compte et la sécurité de votre accès.
          </p>
        </header>
        {children}
      </div>
    </main>
  );
}

// ── Profile card ─────────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: AdminProfile }) {
  const roleLabel = profile.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur';
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        Profil
      </h2>
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-full bg-[#e2366a]/10 flex items-center justify-center shrink-0">
          <span className="text-[#e2366a] font-bold text-lg uppercase">
            {profile.email[0]}
          </span>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{profile.email}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{roleLabel}</p>
        </div>
      </div>
    </div>
  );
}

// ── 2FA — disabled state ─────────────────────────────────────────────────────

function TwoFaDisabledCard({ onSetup }: { onSetup: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-start gap-4">
        <div className="size-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shrink-0">
          <ShieldExclamationIcon className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Double authentification
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Désactivée
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Activez la 2FA pour protéger votre compte avec Google Authenticator, Authy ou une application compatible TOTP.
          </p>
          <button
            onClick={onSetup}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e2366a] hover:bg-[#c82d5e] text-white text-sm font-semibold transition-colors"
          >
            <QrCodeIcon className="w-4 h-4" />
            Configurer la 2FA
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2FA — enabled state ──────────────────────────────────────────────────────

function TwoFaEnabledCard({ onDisableClick }: { onDisableClick: () => void }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
      <div className="flex items-start gap-4">
        <div className="size-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Double authentification
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              Activée
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Votre compte est protégé par une application TOTP. Chaque connexion requiert un code à 6 chiffres.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Zone de récupération
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Si vous avez perdu votre appareil, désactivez la 2FA en confirmant votre mot de passe.
            </p>
            <button
              onClick={onDisableClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
            >
              <XCircleIcon className="w-4 h-4" />
              Désactiver la 2FA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Setup flow ───────────────────────────────────────────────────────────────

function SetupCard({
  setup, onConfirm, onCancel,
}: {
  setup: SetupData;
  onConfirm: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code invalide');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#e2366a]/30 p-6">
      <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Configurer la 2FA</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Scannez ce QR code avec votre application TOTP, puis saisissez le premier code généré.
      </p>

      {/* QR code */}
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.qrCode}
            alt="QR code 2FA"
            width={180}
            height={180}
            className="block"
          />
        </div>
      </div>

      {/* Manual entry fallback */}
      <details className="mb-6 text-sm">
        <summary className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 select-none">
          Saisie manuelle (si le scan ne fonctionne pas)
        </summary>
        <p className="mt-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 font-mono text-xs break-all text-slate-700 dark:text-slate-300 select-all">
          {setup.otpauthUri}
        </p>
      </details>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="setup-code" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Code de confirmation
          </label>
          <input
            id="setup-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-2xl font-mono tracking-[0.5em] text-center placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#e2366a]/40 focus:border-[#e2366a] transition"
            placeholder="000000"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e2366a] hover:bg-[#c82d5e] disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {loading ? 'Activation…' : 'Activer la 2FA'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Disable flow ─────────────────────────────────────────────────────────────

function DisableCard({
  onConfirm, onCancel,
}: {
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800/40 p-6">
      <div className="flex items-center gap-2 mb-1">
        <KeyIcon className="w-5 h-5 text-amber-500" />
        <h2 className="font-bold text-slate-900 dark:text-slate-100">Désactiver la 2FA</h2>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Confirmez votre mot de passe pour désactiver la double authentification. Cette action invalidera toutes vos sessions actives.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="disable-password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Mot de passe du compte
          </label>
          <input
            id="disable-password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition"
            placeholder="••••••••"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || password.length < 6}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
          >
            {loading ? 'Vérification…' : 'Confirmer la désactivation'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function SuccessBanner({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">{title}</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-emerald-500 hover:text-emerald-700 text-xs underline">
          OK
        </button>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-[#e2366a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 text-center">
      <p className="text-red-700 dark:text-red-300 text-sm mb-3">{message}</p>
      <button onClick={onRetry} className="text-sm text-[#e2366a] font-semibold hover:underline">
        Réessayer
      </button>
    </div>
  );
}
