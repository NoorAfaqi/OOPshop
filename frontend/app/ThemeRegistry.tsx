"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { appTheme } from "./theme";

// Create emotion cache with consistent configuration
const createEmotionCache = () => {
  return createCache({
    key: "mui",
    prepend: true,
  });
};

export function ThemeRegistry({ children }: { children: ReactNode }) {
  // Create emotion cache only once
  const cache = useMemo(() => createEmotionCache(), []);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}


