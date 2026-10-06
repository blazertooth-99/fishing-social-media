"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ApiFishingSpot,
  buildCreateSpotPayload,
  createSpot,
  extractSpotErrorMessages,
  SpotPrivacy,
  SpotWaterType,
} from "@/lib/api/fishing-spots";

interface CreateFishingSpotDialogProps {
  defaultLat?: number;
  defaultLng?: number;
  onCreated?: (spot: ApiFishingSpot) => void;
  triggerClassName?: string;
}

const WATER_TYPES: SpotWaterType[] = ["FRESHWATER", "SALTWATER", "BRACKISH"];
const PRIVACIES: SpotPrivacy[] = ["EXACT", "APPROXIMATE", "PRIVATE"];

/**
 * POST /api/v1/locations/spots — flat snake_case body (name, description,
 * lat, lng, water_type, privacy). Auth required (Bearer/cookie via apiFetch).
 */
export default function CreateFishingSpotDialog({
  defaultLat = 0,
  defaultLng = 1,
  onCreated,
  triggerClassName,
}: CreateFishingSpotDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState(String(defaultLat));
  const [lng, setLng] = useState(String(defaultLng));
  const [waterType, setWaterType] = useState<SpotWaterType>("FRESHWATER");
  const [privacy, setPrivacy] = useState<SpotPrivacy>("APPROXIMATE");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors([]);

    const parsedLat = Number(String(lat).replace(",", "."));
    const parsedLng = Number(String(lng).replace(",", "."));
    const localErrors: string[] = [];
    if (!name.trim()) localErrors.push("Spot name is required");
    if (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      localErrors.push("lat: Latitude must be between -90 and 90");
    }
    if (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      localErrors.push("lng: Longitude must be between -180 and 180");
    }
    if (localErrors.length > 0) {
      setErrors(localErrors);
      return;
    }

    setIsSaving(true);
    try {
      const detail = await createSpot(
        buildCreateSpotPayload({
          name,
          description,
          lat: parsedLat,
          lng: parsedLng,
          waterType,
          privacy,
        }),
      );
      onCreated?.({
        id: detail.id,
        name: detail.name,
        water_type: detail.water_type,
        lat: detail.coordinates?.lat ?? parsedLat,
        lng: detail.coordinates?.lng ?? parsedLng,
        distance_meters: null,
        average_rating: detail.average_rating ?? null,
        review_count: detail.review_count ?? 0,
        privacy: detail.privacy,
      });
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      setErrors(extractSpotErrorMessages(err, "Failed to create fishing spot"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button className={triggerClassName} onClick={() => setOpen(true)}>
        <Plus size={16} />
        Add spot
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
        <DialogHeader>
          <DialogTitle>Add fishing spot</DialogTitle>
          <DialogDescription>
            Share a natural fishing spot. Coordinates use flat lat / lng per API guide.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="spot-name">Name</Label>
            <Input
              id="spot-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eagle Rock Cove"
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="spot-description">Description</Label>
            <Textarea
              id="spot-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rocky point with deep drop-off."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="spot-lat">Latitude</Label>
              <Input
                id="spot-lat"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                inputMode="decimal"
                placeholder="-6.2088"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spot-lng">Longitude</Label>
              <Input
                id="spot-lng"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                inputMode="decimal"
                placeholder="106.8456"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Water type</Label>
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value as SpotWaterType)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {WATER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Privacy</Label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as SpotPrivacy)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PRIVACIES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? "Saving..." : "Create spot"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
