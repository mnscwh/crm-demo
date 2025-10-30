// === FILE: lib/utils.ts ===
/** Обчислення відсотка */
export const pct = (a: number = 0, b: number = 1): number => {
  if (!b) return 0;
  return Math.round((a / b) * 100);
};

/** Безпечне сортування */
export const safeSort = <T>(arr: T[], key: keyof T): T[] => {
  return [...arr].sort((a: any, b: any) => {
    const av = a[key] ?? 0;
    const bv = b[key] ?? 0;
    if (av > bv) return -1;
    if (av < bv) return 1;
    return 0;
  });
};