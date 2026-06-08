import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/globals.css';
import Providers from './providers';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Nouri Fashion — Admin',
  description: 'Tableau de bord administrateur Nouri Fashion',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body
        className="bg-[#fcfafa] dark:bg-[#1a1114] text-slate-900 dark:text-slate-100 antialiased"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
