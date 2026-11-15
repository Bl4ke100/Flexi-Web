"use client";

import { useEffect, useState } from "react";

// Keep short landscape screens in the same readable flow as phones and tablets.
export const PINNED_SCROLL_QUERY = "(min-width: 1280px) and (min-height: 900px)";

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
