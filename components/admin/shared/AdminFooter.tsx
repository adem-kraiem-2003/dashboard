import React from 'react';

export default function AdminFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 dark:border-slate-800 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs font-medium">
        <p>© 2024 Admin Console. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#e2366a]">
            Help Center
          </a>
          <a href="#" className="hover:text-[#e2366a]">
            API Documentation
          </a>
          <a href="#" className="hover:text-[#e2366a]">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
