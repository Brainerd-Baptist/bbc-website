"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      // New key (was the default "theme"). Phones that had pinned light or
      // dark with the old toggle keep that value under the old key, so this
      // resets everyone to following the device's light/dark setting.
      storageKey="bbc-theme"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
