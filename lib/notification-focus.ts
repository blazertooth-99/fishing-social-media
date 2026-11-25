const KEY = "fishconnect:pending-comment-focus";

export interface PendingCommentFocus {
  postId: string;
  commentId: string | null;
  highlight: boolean;
  at: number;
}

export function setPendingCommentFocus(focus: PendingCommentFocus): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(focus));
  } catch {}
}

export function takePendingCommentFocus(
  postId: string,
): PendingCommentFocus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCommentFocus;
    if (!parsed || parsed.postId !== postId) return null;
    if (Date.now() - parsed.at > 30_000) {
      window.sessionStorage.removeItem(KEY);
      return null;
    }
    window.sessionStorage.removeItem(KEY);
    return parsed;
  } catch {
    return null;
  }
}
