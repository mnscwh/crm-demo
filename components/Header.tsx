"use client";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold tracking-tight text-slate-800 text-lg hover:text-sky-700 transition">
          CRM Demo
        </Link>
        {/* справа ничего не рендерим — кнопки “Дашборд” нет */}
        <div />
      </div>
    </header>
  );
}