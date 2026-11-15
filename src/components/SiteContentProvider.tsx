"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CONTENT, type PublicContent } from "@/data/siteContent";

const SiteContentContext = createContext<PublicContent>(DEFAULT_CONTENT);
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { cache: "no-store", signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error("Content unavailable"); return response.json(); })
      .then(setContent).catch(() => {});
    return () => controller.abort();
  }, []);
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}
export const useSiteContent = () => useContext(SiteContentContext);
