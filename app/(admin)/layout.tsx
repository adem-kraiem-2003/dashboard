import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Skip navigation — visible uniquement au focus clavier (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-1/2 focus:-translate-x-1/2 focus:z-[999] focus:px-5 focus:py-2.5 focus:bg-[#e2366a] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Aller au contenu principal
      </a>
      <AdminSidebar />
      <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 overflow-hidden focus:outline-none">
        {children}
      </div>
    </div>
  );
}
