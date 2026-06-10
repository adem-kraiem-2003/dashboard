'use client';

import { useMemo } from 'react';
import type { Commande } from '@/types/api.types';
import { formatPrice } from '@/lib/format';

interface DashboardRevenueChartProps {
  loading: boolean;
  chartPeriod: string;
  onPeriodChange: (period: string) => void;
  commandes: Commande[];
}

interface DataPoint {
  label: string;
  total: number;
}

function getWeekData(commandes: Commande[]): DataPoint[] {
  const today = new Date();
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((label, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dayStr = date.toISOString().slice(0, 10);
    const total = commandes
      .filter(c => (c.date ?? c.createdAt)?.slice(0, 10) === dayStr)
      .reduce((s, c) => s + c.total, 0);
    return { label, total };
  });
}

function getMonthData(commandes: Commande[]): DataPoint[] {
  const today = new Date();
  return ['S1', 'S2', 'S3', 'S4'].map((label, i) => {
    const start = new Date(today);
    start.setDate(today.getDate() - (28 - i * 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const total = commandes
      .filter(c => {
        const d = new Date(c.date ?? c.createdAt ?? '');
        return d >= start && d < end;
      })
      .reduce((s, c) => s + c.total, 0);
    return { label, total };
  });
}

const W = 400;
const H = 140;

function buildSvgPaths(points: DataPoint[]): { line: string; area: string; dots: { x: number; y: number }[] } {
  const max = Math.max(...points.map(p => p.total), 1);
  const n = points.length;
  const xs = points.map((_, i) => (i / Math.max(n - 1, 1)) * W);
  const ys = points.map(p => H - (p.total / max) * H * 0.88 - H * 0.06);

  let line = `M${xs[0]},${ys[0]}`;
  for (let i = 1; i < n; i++) {
    const cpX = (xs[i - 1] + xs[i]) / 2;
    line += ` C${cpX},${ys[i - 1]} ${cpX},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  const area = `${line} L${W},${H} L0,${H} Z`;
  const dots = xs.map((x, i) => ({ x, y: ys[i] }));
  return { line, area, dots };
}

export default function DashboardRevenueChart({
  loading,
  chartPeriod,
  onPeriodChange,
  commandes,
}: DashboardRevenueChartProps) {
  const isWeek = chartPeriod === 'Cette Semaine';

  const points = useMemo(
    () => (isWeek ? getWeekData(commandes) : getMonthData(commandes)),
    [commandes, isWeek],
  );

  const periodTotal = points.reduce((s, p) => s + p.total, 0);
  const { line, area, dots } = useMemo(() => buildSvgPaths(points), [points]);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold">Chiffre d&apos;Affaires</h2>
          <p className="text-xs text-slate-500">
            {isWeek ? 'Performance des 7 derniers jours' : 'Performance des 4 dernières semaines'}
          </p>
          {!loading && (
            <p className="text-xl font-extrabold text-[#e2366a] mt-1 tabular-nums">
              {formatPrice(periodTotal)}
            </p>
          )}
        </div>
        <select
          className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-semibold py-1.5 focus:ring-0"
          value={chartPeriod}
          onChange={e => onPeriodChange(e.target.value)}
          aria-label="Période du graphique"
        >
          <option>Cette Semaine</option>
          <option>Mois Dernier</option>
        </select>
      </div>

      {loading ? (
        <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ) : periodTotal === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
          Aucune vente sur cette période
        </div>
      ) : (
        <div className="mt-2">
          <svg
            className="w-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Graphique CA ${isWeek ? 'cette semaine' : 'mois dernier'} : ${formatPrice(periodTotal)}`}
          >
            <defs>
              <linearGradient id="revGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#e2366a', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#e2366a', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#revGrad)" />
            <path d={line} fill="none" stroke="#e2366a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {dots.map((pt, i) => (
              <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#e2366a" stroke="white" strokeWidth="2" />
            ))}
          </svg>
          <div className="flex justify-between mt-3 px-1">
            {points.map(p => (
              <span key={p.label} className="text-[10px] font-bold text-slate-400">{p.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
