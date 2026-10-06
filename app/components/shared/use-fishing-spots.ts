"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiFishingSpot,
  discoverySpotToMapItem,
  extractSpotErrorMessage,
  listSpots,
  querySpotsNearby,
  searchSpots,
} from "@/lib/api/fishing-spots";

const DEFAULT_LAT = 0;
const DEFAULT_LNG = 1;
const DEFAULT_LIMIT = 20;

interface UseFishingSpotsOptions {
  limit?: number;
}

/**
 * Shared fishing-spot loader for desktop + mobile + sidebar.
 * - Empty query -> spatial list (nearby user location, fallback to 0,1
 *   where the live backend actually has seed spots).
 * - Non-empty query -> GET /discovery/spots?q= (trigram search).
 */
export function useFishingSpots(opts?: UseFishingSpotsOptions) {
  const limit = opts?.limit ?? DEFAULT_LIMIT;
  const [spots, setSpots] = useState<ApiFishingSpot[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debounce search input -> discovery query.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // One-shot geolocation (best effort, never blocks the list).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mountedRef.current) return;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {},
      { timeout: 5000 },
    );
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let items: ApiFishingSpot[];
      if (debouncedQuery) {
        const found = await searchSpots(debouncedQuery);
        items = found.map(discoverySpotToMapItem);
      } else if (coords) {
        try {
          items = await querySpotsNearby({
            lat: coords.lat,
            lng: coords.lng,
            radius: 100000,
            limit,
          });
        } catch {
          items = [];
        }
        // Live seed data lives around (0,0)-(0,1); user coords elsewhere
        // (e.g. Indonesia) may legitimately return [] — fall back so the
        // page still shows real API data instead of an empty screen.
        if (items.length === 0) {
          items = await listSpots({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, limit });
        }
      } else {
        items = await listSpots({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, limit });
      }
      if (mountedRef.current) setSpots(items);
    } catch (err) {
      if (mountedRef.current) {
        setError(extractSpotErrorMessage(err, "Failed to load fishing spots"));
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [debouncedQuery, coords, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  const prependSpot = useCallback((spot: ApiFishingSpot) => {
    setSpots((prev) => {
      if (prev.some((s) => s.id === spot.id)) return prev;
      return [spot, ...prev];
    });
  }, []);

  return {
    spots,
    query,
    setQuery,
    isLoading,
    error,
    reload: load,
    prependSpot,
    userCoords: coords,
  };
}
