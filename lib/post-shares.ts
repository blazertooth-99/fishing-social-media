const STORAGE_KEY = "fishconnect:post-shares";

export const POST_SHARE_EVENT = "fishconnect:post-shared";

function readShares(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        result[key] = Math.floor(value);
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function getPostShareCount(postId: string): number {
  return readShares()[postId] ?? 0;
}

export function recordPostShare(postId: string): number {
  const shares = readShares();
  const next = (shares[postId] ?? 0) + 1;
  shares[postId] = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shares));
  } catch {
    return next;
  }
  window.dispatchEvent(
    new CustomEvent(POST_SHARE_EVENT, {
      detail: { postId, count: next },
    }),
  );
  return next;
}
