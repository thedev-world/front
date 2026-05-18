export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (abs >= 10_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatFullNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatAccountAge(isoDate: string): {
  joined: string;
  years: number;
  months: number;
  stardate: string;
} {
  const created = new Date(isoDate);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth());
  const years = Math.floor(Math.max(totalMonths, 0) / 12);
  const months = Math.max(totalMonths, 0) % 12;

  const joined = created.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Stardate-flavored format: YYYY.DDD (day of year)
  const start = new Date(created.getFullYear(), 0, 0);
  const diff = created.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000)
    .toString()
    .padStart(3, "0");
  const stardate = `${created.getFullYear()}.${dayOfYear}`;

  return { joined, years, months, stardate };
}

export function formatRelativeTime(isoDate: string): string {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return "—";
  const diffSec = Math.round((Date.now() - target) / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 30) return `${diffD}d ago`;
  const diffMo = Math.round(diffD / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return `${Math.round(diffMo / 12)}y ago`;
}
