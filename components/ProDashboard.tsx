// === FILE: components/ProDashboard.tsx ===
"use client";

import { useEffect, useState } from "react";
import { UploadPanel } from "./UploadPanel";
import { DocumentList } from "./DocumentList";
import { AnalyticsChart } from "./AnalyticsChart";
import { AICopilot } from "./AICopilot";
import { DocsModal } from "./DocsModal";
import { motion } from "framer-motion";

export function ProDashboard() {
  const [stats, setStats] = useState({ total: 0, overdue: 0, pending: 0 });
  const [openModal, setOpenModal] = useState<"all" | "overdue" | "pending" | null>(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  useEffect(() => {
    fetch("/api/deadlines", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setStats(d.stats))
      .catch(() => {});
  }, []);

  const handleRefresh = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <motion.div
      className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fadeIn"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="xl:col-span-8 space-y-6">
        {/* === СТАТИСТИКА === */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Stat
            className="md:col-span-3"
            title="Всього"
            value={stats.total}
            tone="sky"
            onClick={() => setOpenModal("all")}
          />
          <Stat
            className="md:col-span-2"
            title="Прострочено"
            value={stats.overdue}
            tone="rose"
            onClick={() => setOpenModal("overdue")}
          />
          <Stat
            className="md:col-span-1"
            title="Очікує"
            value={stats.pending}
            tone="emerald"
            onClick={() => setOpenModal("pending")}
          />
        </div>

        {/* === АНАЛІТИКА === */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
          >
            <AnalyticsChart />
          </motion.div>
          <div className="lg:col-span-2" />
        </div>

        {/* === ЗАВАНТАЖЕННЯ ДОКУМЕНТІВ === */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            <UploadPanel />
            <button
              onClick={handleRefresh}
              className="mt-3 w-full text-sm bg-sky-100 hover:bg-sky-200 text-sky-800 font-medium py-2 rounded-lg transition"
            >
              🔄 Оновити документи
            </button>
          </motion.div>
          <div className="lg:col-span-4" />
        </div>

        {/* === СПИСОК ДОКУМЕНТІВ === */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <DocumentList onSelect={() => {}} refreshSignal={refreshSignal} />
        </motion.div>
      </div>

      {/* === БОКОВА ПАНЕЛЬ === */}
      <aside className="xl:col-span-4">
        <div className="sticky top-6">
          <AICopilot />
        </div>
      </aside>

      {openModal && <DocsModal type={openModal} onClose={() => setOpenModal(null)} />}
    </motion.div>
  );
}

function Stat({
  title,
  value,
  tone,
  onClick,
  className = "",
}: {
  title: string;
  value: number;
  tone: "sky" | "rose" | "emerald";
  onClick: () => void;
  className?: string;
}) {
  const toneCls =
    tone === "rose"
      ? "from-[#ffe8f0] via-white to-white border-rose-200"
      : tone === "emerald"
      ? "from-[#e7fff5] via-white to-white border-emerald-200"
      : "from-[#e7efff] via-white to-white border-sky-200";

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`card bg-gradient-to-br ${toneCls} p-5 text-left ${className}`}
    >
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
    </motion.button>
  );
}