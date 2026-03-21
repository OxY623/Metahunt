const INTRO_PENDING_KEY = "metahunt_intro_foxy_pending";

export function setIntroPending() {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTRO_PENDING_KEY, "1");
}

export function clearIntroPending() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INTRO_PENDING_KEY);
}

export function isIntroPending() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(INTRO_PENDING_KEY) === "1";
}

export function hasSeenIntro(userId: string) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`metahunt_intro_foxy_seen_${userId}`) === "1";
}

export function markIntroSeen(userId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`metahunt_intro_foxy_seen_${userId}`, "1");
  clearIntroPending();
}
