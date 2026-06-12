'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin-error]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Cette page n&apos;a pas pu se charger
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Une erreur inattendue est survenue.
          </p>
          {error.digest && (
            <p className="mt-1 text-xs font-mono text-slate-400 dark:text-slate-500">
              Réf : {error.digest}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-[#e2366a] text-white text-sm font-bold shadow-sm shadow-[#e2366a]/20 hover:bg-[#e2366a]/90 transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
