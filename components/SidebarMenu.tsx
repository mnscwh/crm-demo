"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  CalendarDays,
} from "lucide-react";

export function SidebarMenu() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  const links = [
    { name: "Головна", path: "/", icon: Home },
    { name: "Дашборд", path: "/dashboard", icon: LayoutDashboard },
    { name: "Клієнти", path: "/clients", icon: Users },
    { name: "Справи", path: "/cases", icon: Briefcase },
    { name: "Документи", path: "/dashboard/documents", icon: FileText },
    { name: "Календар", path: "/calendar", icon: CalendarDays },
  ];

  return (
    <aside
      className={`transition-all duration-500 ${
        open ? "w-64" : "w-16"
      } bg-white/70 backdrop-blur-md border-r border-gray-200 flex flex-col`}
    >
      {/* Верхняя панель */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-600 hover:text-indigo-600"
        >
          <Menu size={22} />
        </button>
        {open && (
          <span className="font-semibold text-lg text-indigo-700">Меню</span>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 flex flex-col gap-1 px-2">
        {links.map(({ name, path, icon: Icon }) => {
          const isExact = pathname === path;
          const isChild = path !== "/dashboard" && pathname.startsWith(`${path}/`);
          const active = isExact || isChild;
          return (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 rounded-lg py-2 px-3 text-sm transition-all ${
                active
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
              }`}
            >
              <Icon size={18} />
              {open && <span>{name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}