'use client';

interface DashboardRevenueChartProps {
  loading: boolean;
  chartPeriod: string;
  onPeriodChange: (period: string) => void;
}

export default function DashboardRevenueChart({ loading, chartPeriod, onPeriodChange }: DashboardRevenueChartProps) {
  const isWeek = chartPeriod === 'Cette Semaine';

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-base font-bold">Chiffre d&apos;Affaires</h2>
          <p className="text-xs text-slate-500">
            {isWeek ? 'Performance des 7 derniers jours' : 'Performance du mois dernier'}
          </p>
        </div>
        <select
          className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold py-1.5 focus:ring-0"
          value={chartPeriod}
          onChange={e => onPeriodChange(e.target.value)}
        >
          <option>Cette Semaine</option>
          <option>Mois Dernier</option>
        </select>
      </div>

      {loading ? (
        <div className="h-[240px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : (
        <div className="relative h-[240px] w-full mt-4">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 150">
            <defs>
              <linearGradient id="revenueGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e2366a', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#e2366a', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            {isWeek ? (
              <>
                <path d="M0,130 C40,120 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,20 L400,150 L0,150 Z" fill="url(#revenueGrad)" />
                <path d="M0,130 C40,120 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,20" fill="none" stroke="#e2366a" strokeLinecap="round" strokeWidth="3" />
                <circle cx="120" cy="60" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
                <circle cx="240" cy="40" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
                <circle cx="360" cy="30" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
              </>
            ) : (
              <>
                <path d="M0,120 C30,100 60,80 90,90 C120,100 150,50 200,60 C250,70 300,30 360,20 L400,15 L400,150 L0,150 Z" fill="url(#revenueGrad)" />
                <path d="M0,120 C30,100 60,80 90,90 C120,100 150,50 200,60 C250,70 300,30 360,20 L400,15" fill="none" stroke="#e2366a" strokeLinecap="round" strokeWidth="3" />
                <circle cx="90"  cy="90" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
                <circle cx="200" cy="60" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
                <circle cx="360" cy="20" fill="#e2366a" r="4" stroke="white" strokeWidth="2" />
              </>
            )}
          </svg>
          <div className="flex justify-between mt-4 px-2">
            {(isWeek
              ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
              : ['S1', 'S2', 'S3', 'S4']
            ).map(label => (
              <span key={label} className="text-[10px] font-bold text-slate-400">{label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
