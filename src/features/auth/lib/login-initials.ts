export function loginInitials(login: string): string {
  const trimmed = login.trim();
  if (!trimmed) return "??";
  return trimmed.slice(0, 2).toUpperCase();
}
