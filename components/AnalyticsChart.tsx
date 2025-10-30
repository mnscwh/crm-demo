// components/AnalyticsChart.tsx  (ApexCharts)
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
const ReactApexChart: any = dynamic(() => import("react-apexcharts"), { ssr: false });

export function AnalyticsChart() {
  const series = useMemo(() => ([
    { name: "Документи", type: "column", data: [3, 4, 3, 5, 6, 3, 2] },
    { name: "AI висновки", type: "line", data: [2, 4, 2, 4, 5, 2, 1] }
  ]), []);

  const options = useMemo(() => ({
    chart: { toolbar: { show: false }, foreColor: "#475569" },
    stroke: { width: [0, 3] },
    dataLabels: { enabled: true, enabledOnSeries: [1] },
    grid: { borderColor: "#e2e8f0" },
    xaxis: { categories: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип"] },
    colors: ["#9aa7ff", "#6b8bff"],
    tooltip: { theme: "light" },
    legend: { show: true }
  }), []);

  return (
    <div id="analytics" className="card p-5">
      <h2 className="text-lg font-semibold mb-3">Трафік / Обробка документів</h2>
      <ReactApexChart options={options} series={series} type="line" height={300} />
    </div>
  );
}