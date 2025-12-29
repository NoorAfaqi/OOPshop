"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { appTheme } from "./theme";

export function ThemeRegistry({ children }: { children: ReactNode }) {
  // Create emotion cache only once on the client
  const cache = useMemo(
    () =>
      createCache({
        key: "mui",
        prepend: true,
      }),
    []
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}


