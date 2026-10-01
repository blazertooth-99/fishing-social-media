"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import {
  extractApiErrorMessages,
  getPostById,
  updatePost,
  type ApiPost,
  type PostPrivacy,
} from "@/lib/api/posts";

interface EditPostDialogProps {
  post: ApiPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (post: ApiPost) => void;
}

/**
 * Update Post — PATCH /api/v1/posts/{id} (author only).
 * Only caption + privacy are editable; photos & location are fixed at creation.
 * Shared by /feed and /profile (desktop & mobile).
 */
export default function EditPostDialog({
  post,
  open,
  onOpenChange,
  onUpdated,
}: EditPostDialogProps) {
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<PostPrivacy>("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    async function syncForm() {
      if (!open || !post) return;
      setContent(post.content ?? "");
      setPrivacy((post.privacy as PostPrivacy) ?? "PUBLIC");
      setErrors([]);
    }

    syncForm();
  }, [open, post]);

  async function handleSave() {
    if (!post) return;
    setErrors([]);

    const caption = content.trim();
    if (caption.length === 0) {
      setErrors(["Caption is required for a post"]);
      return;
    }
    if (caption.length > 1000) {
      setErrors(["Caption must not exceed 1000 characters"]);
      return;
    }
    if (caption === post.content && privacy === post.privacy) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePost(post.id, {
        content: caption,
        privacy,
      });
      // Re-fetch detail (GET /api/v1/posts/{id}) so the list shows fresh data.
      const fresh = await getPostById(updated.id);
      onOpenChange(false);
      onUpdated?.(fresh);
    } catch (err) {
      console.error("UPDATE POST FAILED:", err);
      setErrors(extractApiErrorMessages(err, "Failed to update post"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
          <DialogDescription>
            Only the caption and privacy can be changed. Photos and location
            are fixed when the post is created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Write a caption…"
            className="resize-none rounded-2xl text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400">
              {content.trim().length}/1000
            </p>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              Privacy
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as PostPrivacy)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="PUBLIC">Public</option>
                <option value="FOLLOWERS_ONLY">Followers only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {errors.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
