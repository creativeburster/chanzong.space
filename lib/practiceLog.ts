// 禅修工坊 · 本地修持记录工具（纯 localStorage，无任何上传）

/** 本地时区日期键 YYYY-MM-DD（避免 toISOString 的 UTC 偏移导致北京时间 08:00 才换日） */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return localDateKey(d);
}

const LAST_KEY = 'zen_last_practice_date';
const STREAK_KEY = 'zen_streak_days';

/**
 * 记录“今天确实修行过”。连续天数规则：
 * - 昨天修过 → 连续天数 +1；
 * - 今天已记录 → 不变；
 * - 中断过 → 重新从 1 计。
 */
export function markPracticeToday(): void {
  try {
    const today = localDateKey();
    const last = localStorage.getItem(LAST_KEY);
    if (last === today) return;
    const prev = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10) || 0;
    const next = last === yesterdayKey() ? prev + 1 : 1;
    localStorage.setItem(LAST_KEY, today);
    localStorage.setItem(STREAK_KEY, String(next));
  } catch {
    // 隐私模式等场景下 localStorage 不可用，忽略
  }
}

/** 读取当前有效的连续修行天数（中断超过一天则为 0） */
export function readStreak(): number {
  try {
    const last = localStorage.getItem(LAST_KEY);
    if (last !== localDateKey() && last !== yesterdayKey()) return 0;
    return parseInt(localStorage.getItem(STREAK_KEY) || '0', 10) || 0;
  } catch {
    return 0;
  }
}
