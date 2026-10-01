"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, MapPin, Send, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { resolveMediaId, uploadMedia } from "@/lib/api/media";
import {
  buildCreatePostPayload,
  createPost,
  extractApiErrorMessages,
  getPostById,
  parseCoordinate,
  type ApiPost,
  type LocationPrivacy,
  type PostPrivacy,
} from "@/lib/api/posts";

interface CreatePostProps {
  onPostCreated?: (post: ApiPost) => void;
}

interface PendingPhoto {
  file: File;
  previewUrl: string;
}

const MAX_PHOTOS = 10;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationPrivacy, setLocationPrivacy] =
    useState<LocationPrivacy>("APPROXIMATE");
  const [privacy, setPrivacy] = useState<PostPrivacy>("PUBLIC");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setErrors([]);

    const next: PendingPhoto[] = [...photos];
    for (const file of files) {
      if (next.length >= MAX_PHOTOS) {
        setErrors([`A post cannot have more than ${MAX_PHOTOS} photos`]);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        setErrors([`"${file.name}" exceeds 15 MB and was skipped`]);
        continue;
      }
      next.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    setPhotos(next);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit() {
    setErrors([]);
    setUploadProgress(null);

    const caption = content.trim();
    if (caption.length === 0) {
      setErrors(["Caption is required for a post"]);
      return;
    }
    if (caption.length > 1000) {
      setErrors(["Caption must not exceed 1000 characters"]);
      return;
    }
    if (photos.length === 0) {
      setErrors(["At least one photo is required for a post"]);
      return;
    }
    const latResult = parseCoordinate(latitude, "latitude");
    if (!latResult.ok) {
      setErrors([latResult.error]);
      return;
    }
    const lngResult = parseCoordinate(longitude, "longitude");
    if (!lngResult.ok) {
      setErrors([lngResult.error]);
      return;
    }
    if (locationName.trim().length > 255) {
      setErrors(["Location name must not exceed 255 characters"]);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload photos -> media_ids (POST /api/v1/media/upload)
      const mediaIds: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(`Uploading photo ${i + 1}/${photos.length}…`);
        try {
          const uploaded = await uploadMedia(photos[i].file);
          const mediaId = resolveMediaId(uploaded);
          if (!mediaId) throw { status: undefined, data: null };
          mediaIds.push(mediaId);
        } catch (err) {
          console.error("MEDIA UPLOAD FAILED:", err);
          setErrors([
            `Photo ${i + 1} upload failed:`,
            ...extractApiErrorMessages(err, "Failed to upload photo"),
          ]);
          return;
        }
      }

      // 2. Create post (POST /api/v1/posts) — minimal verified body:
      // content + media_ids + latitude/longitude (+ location_name only if set).
      const payload = buildCreatePostPayload({
        content: caption,
        mediaIds,
        latitude: latResult.value,
        longitude: lngResult.value,
        locationName,
        locationPrivacy,
        privacy,
      });
      console.debug("CREATE POST PAYLOAD:", payload);

      let created: ApiPost;
      try {
        created = await createPost(payload);
      } catch (err) {
        console.error("CREATE POST FAILED:", err);
        setErrors(extractApiErrorMessages(err, "Failed to publish post"));
        return;
      }

      // 3. Re-fetch detail (GET /api/v1/posts/{id}) and display on /feed list
      const fresh = await getPostById(created.id);

      // Reset composer
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setPhotos([]);
      setContent("");
      setLocationName("");
      setLatitude("");
      setLongitude("");
      setExpanded(false);

      onPostCreated?.(fresh);
    } catch (err) {
      console.error("POST FLOW FAILED:", err);
      setErrors(extractApiErrorMessages(err, "Failed to publish post"));
    } finally {
      setUploadProgress(null);
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="text-thover">CS</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            {!expanded ? (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-400 transition hover:bg-thover/20"
              >
                What did you catch today?
              </button>
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you catch today? (caption required)"
                maxLength={1000}
                rows={3}
                className="resize-none rounded-2xl border-slate-200 bg-slate-50 text-sm focus-visible:ring-emerald-500"
              />
            )}
            {expanded && (
              <p className="mt-1 text-right text-[11px] text-slate-400">
                {content.trim().length}/1000
              </p>
            )}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={handlePickFiles}
            />

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {photos.map((photo, i) => (
                  <div
                    key={`${photo.previewUrl}-${i}`}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                  >
                    <Image
                      src={photo.previewUrl}
                      alt={`Upload preview ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Spot name (e.g. Muara Citarum)"
                maxLength={255}
                className="rounded-xl text-sm"
              />
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude* (-6.2088)"
                inputMode="decimal"
                className="rounded-xl text-sm"
              />
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude* (106.8456)"
                inputMode="decimal"
                className="rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Location privacy
                <select
                  value={locationPrivacy}
                  onChange={(e) =>
                    setLocationPrivacy(e.target.value as LocationPrivacy)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="APPROXIMATE">Approximate (default)</option>
                  <option value="EXACT">Exact</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Post privacy
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

            {uploadProgress && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                {uploadProgress}
              </p>
            )}

            {errors.length > 0 && (
              <div className="space-y-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {errors.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(true);
              fileRef.current?.click();
            }}
            className="gap-2 rounded-xl text-slate-500 hover:bg-primary-hover/20"
          >
            <ImagePlus size={17} />
            Photo ({photos.length}/{MAX_PHOTOS})
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="gap-2 rounded-xl text-slate-500 hover:bg-primary-hover/20"
          >
            <MapPin size={17} />
            Location
          </Button>

          {expanded && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpanded(false);
                setErrors([]);
              }}
              className="rounded-xl text-slate-400"
            >
              Cancel
            </Button>
          )}

          <div className="ml-auto">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 rounded-xl bg-primary px-5 hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? (
                <>
                  Posting
                  <Loader2 size={15} className="animate-spin" />
                </>
              ) : (
                <>
                  Post
                  <Send size={15} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
