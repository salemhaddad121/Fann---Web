"use client";

import { useEffect, useState } from "react";
import { getUserPublicInfo, type PublicUserInfo } from "@/lib/users-api";

export function usePublicInfoMap(userIds: string[]) {
  const [map, setMap] = useState<Record<string, PublicUserInfo>>({});
  const key = Array.from(new Set(userIds)).sort().join(",");

  useEffect(() => {
    const uniqueIds = key ? key.split(",") : [];
    if (uniqueIds.length === 0) return;

    let cancelled = false;
    Promise.all(uniqueIds.map((id) => getUserPublicInfo(id).catch(() => null))).then((results) => {
      if (cancelled) return;
      setMap((prev) => {
        const next = { ...prev };
        uniqueIds.forEach((id, i) => {
          const info = results[i];
          if (info) next[id] = info;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return map;
}
