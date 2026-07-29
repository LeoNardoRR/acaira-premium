"use client";

import { useEffect, useState } from "react";

function readPathname() {
  if (typeof window === "undefined") return "/";
  if (window.location.hostname.endsWith("github.io")) {
    return window.location.hash.replace(/^#/, "") || "/";
  }
  return window.location.pathname || "/";
}

export function useClientPathname() {
  const [pathname, setPathname] = useState(readPathname);

  useEffect(() => {
    const sync = () => setPathname(readPathname());
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return pathname;
}
