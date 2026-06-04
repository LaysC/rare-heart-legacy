// Simple client-side gate for the admin area.
// NOT real authentication — only hides the admin UI from casual visitors.
// Change the password here whenever you want.
export const ADMIN_PASSWORD = "amor2026";

const KEY = "lais-ex-admin-session";

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function loginAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false;
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
  return true;
}

export function logoutAdmin() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}