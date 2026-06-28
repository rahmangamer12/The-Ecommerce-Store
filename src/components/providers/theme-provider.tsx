"use client";

import { ThemeProvider as NextThemes } from "next-themes";

// Wraps next-themes so the whole app supports dark/light mode
// using the `.dark` class on <html>.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
