"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  buildCreateCommunityPayload,
  createCommunity,
  extractCommunityErrorMessages,
  getCommunityByIdOrSlug,
  isValidCommunitySlug,
  markCommunityJoined,
  notifyCommunityMembershipChanged,
  slugifyCommunityName,
  withMembershipFlag,
  type ApiCommunity,
  type CommunityVisibility,
} from "@/lib/api/communities";

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommunityCreated?: (community: ApiCommunity) => void;
}

export default function CreateCommunityDialog({
  open,
  onOpenChange,
  onCommunityCreated,
}: CreateCommunityDialogProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const autoSlug = slugifyCommunityName(name);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyCommunityName(value));
  }

  function resetForm() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setVisibility("PUBLIC");
    setErrors([]);
  }

  function handleOpenChange(next: boolean) {
    if (!submitting) {
      if (!next) setErrors([]);
      onOpenChange(next);
    }
  }

  async function handleSubmit() {
    setErrors([]);

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setErrors(["Community name must be at least 3 characters."]);
      return;
    }
    if (trimmedName.length > 100) {
      setErrors(["Community name must not exceed 100 characters."]);
      return;
    }

    const effectiveSlug = slug.trim().toLowerCase() || slugifyCommunityName(trimmedName);
    if (!isValidCommunitySlug(effectiveSlug)) {
      setErrors([
        "Slug must be 3-80 chars: lowercase letters, numbers, hyphens (e.g. bay-area-kayak-anglers).",
      ]);
      return;
    }
    if (description.trim().length > 1000) {
      setErrors(["Description must not exceed 1000 characters."]);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildCreateCommunityPayload({
        name: trimmedName,
        slug: effectiveSlug,
        description,
        visibility,
      });

      let created: ApiCommunity;
      try {
        created = await createCommunity(payload);
      } catch (err) {
        setErrors(extractCommunityErrorMessages(err, "Failed to create community"));
        return;
      }

      // Re-fetch detail (GET /communities/{id_or_slug}) and display on /community.
      let fresh: ApiCommunity = created;
      try {
        fresh = await getCommunityByIdOrSlug(created.slug || created.id);
      } catch {
        // Fall back to the create response when detail fetch fails.
      }

      // The creator is OWNER — flag it even when the backend omits the flags
      // so the card shows Owner + lands in Your communities immediately.
      fresh = withMembershipFlag(fresh, "OWNER");
      markCommunityJoined(fresh);

      resetForm();
      onOpenChange(false);
      onCommunityCreated?.(fresh);
      notifyCommunityMembershipChanged();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a community</DialogTitle>
          <DialogDescription>
            Start a fishing community. It appears on this page right after it is
            created. (POST /api/v1/communities)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            Community name *
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Bay Area Kayak Anglers"
              maxLength={100}
              disabled={submitting}
              className="rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            Slug
            <Input
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
              }}
              placeholder={autoSlug || "bay-area-kayak-anglers"}
              maxLength={80}
              disabled={submitting}
              className="rounded-xl font-mono"
            />
            <span className="font-normal text-slate-400">
              Lowercase letters, numbers and hyphens. Auto-generated from the
              name when left as-is.
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            Description
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about? (optional)"
              maxLength={1000}
              rows={3}
              disabled={submitting}
              className="resize-none rounded-xl"
            />
            <span className="text-right font-normal text-slate-400">
              {description.trim().length}/1000
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
            Visibility
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as CommunityVisibility)}
              disabled={submitting}
              className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm text-slate-700 outline-none focus-visible:border-ring"
            >
              <option value="PUBLIC">Public — anyone can discover & join</option>
              <option value="PRIVATE">Private — invite only</option>
            </select>
          </label>

          {errors.length > 0 && (
            <div className="space-y-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {errors.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || name.trim().length < 3}
            className="gap-2 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-60"
          >
            {submitting ? (
              <>
                Creating
                <Loader2 size={15} className="animate-spin" />
              </>
            ) : (
              "Create community"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
