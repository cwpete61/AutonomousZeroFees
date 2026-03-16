"use client";

import { useEffect } from "react";

export function ReferrerCapture() {
  useEffect(() => {
    try {
      const key = "merchant_lead_monster_initial_referrer";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, document.referrer || "");
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
