import { useLayoutEffect } from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "~/lib/theme/provider";
import { UserProvider } from "~/lib/user/provider";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient } from "@tanstack/react-query";
import { createIDBPersister } from "./lib/indexdb-persister";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

const persister = createIDBPersister();

export default function App() {
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (!("theme" in localStorage)) {
        if (e.matches) {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <UserProvider>
        <ThemeProvider>
          <Outlet />
        </ThemeProvider>
      </UserProvider>
    </PersistQueryClientProvider>
  );
}
