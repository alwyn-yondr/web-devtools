import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  Command,
  MagnifyingGlass,
  Sun,
  Moon,
  Star,
} from "phosphor-react";
import { navGroups } from "./navConfig";
import {
  FAVORITES_STORAGE_KEY,
  loadFavoriteToolPaths,
  saveFavoriteToolPaths,
  toggleFavoritePath,
} from "../utils/favoriteTools";
import { subscribeToolModuleLoading, isToolModuleLoading } from "../utils/lazyTool";
import ToolLoadingFallback from "./ToolLoadingFallback";
import ToolErrorBoundary from "./ToolErrorBoundary";
import YondrLogo from "./YondrLogo";

export default function Layout({ toast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemPrefersDark ? "dark" : "light";
  });

  const searchInputRef = useRef(null);

  const [favoritePaths, setFavoritePaths] = useState(loadFavoriteToolPaths);
  const [isToolLoading, setIsToolLoading] = useState(false);
  const [loadingToolPath, setLoadingToolPath] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);

  const beginToolNavigation = (path) => {
    setLoadingToolPath(path);
    setIsToolLoading(true);
  };

  useEffect(() => {
    return subscribeToolModuleLoading((loading) => {
      setIsToolLoading(loading);
      if (!loading) {
        setLoadingToolPath(null);
      }
    });
  }, []);

  useEffect(() => {
    setLoadingToolPath(location.pathname);
    setIsToolLoading(true);
    queueMicrotask(() => {
      if (!isToolModuleLoading()) {
        setIsToolLoading(false);
        setLoadingToolPath(null);
      }
    });
  }, [location.pathname]);

  const allItems = useMemo(() => navGroups.flatMap((g) => g.items), []);
  const validPathSet = useMemo(
    () => new Set(allItems.map((i) => i.path)),
    [allItems],
  );

  const pathToMeta = useMemo(() => {
    const map = new Map();
    for (const g of navGroups) {
      for (const item of g.items) {
        map.set(item.path, { item, groupName: g.name });
      }
    }
    return map;
  }, []);
  const activeItem =
    allItems.find((item) => item.path === location.pathname) ||
    allItems.find((item) => item.path === "/");
  const loadingItem = loadingToolPath
    ? pathToMeta.get(loadingToolPath)?.item
    : null;
  const displayItem = (isToolLoading && loadingItem) || activeItem;

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    const shouldUseDark = theme === "dark";

    if (shouldUseDark) {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
    }

    const themeColor = shouldUseDark ? "#141414" : "#f9f8f6";
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", themeColor));

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Restore last used tool on first load
  useEffect(() => {
    const lastTool = localStorage.getItem("lastToolPath");
    if (lastTool && lastTool !== location.pathname) {
      beginToolNavigation(lastTool);
      navigate(lastTool);
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFavoritePaths((prev) => {
      const next = prev.filter((p) => validPathSet.has(p));
      if (next.length === prev.length) return prev;
      saveFavoriteToolPaths(next);
      return next;
    });
  }, [validPathSet]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== FAVORITES_STORAGE_KEY) return;
      setFavoritePaths(loadFavoriteToolPaths());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsMenuOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Focus search when tools panel opens (desktop only — skip on mobile to avoid keyboard + zoom)
  useEffect(() => {
    if (!isMenuOpen || !searchInputRef.current) return;
    if (window.matchMedia("(min-width: 640px)").matches) {
      searchInputRef.current.focus();
      searchInputRef.current.select?.();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try {
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
    }
  };

  const displayedGroups = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (item, groupName) => {
      if (!q) return true;
      return (
        item.label.toLowerCase().includes(q) ||
        (groupName || "").toLowerCase().includes(q)
      );
    };

    if (favoritePaths.length === 0) {
      return navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            matchesSearch(item, group.name),
          ),
        }))
        .filter((group) => group.items.length > 0);
    }

    const favSet = new Set(favoritePaths);
    const favouriteItems = favoritePaths
      .map((p) => pathToMeta.get(p))
      .filter(
        (meta) =>
          meta !== undefined && matchesSearch(meta.item, meta.groupName),
      )
      .map((meta) => meta.item);

    const otherGroups = navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            matchesSearch(item, group.name) && !favSet.has(item.path),
        ),
      }))
      .filter((group) => group.items.length > 0);

    if (favouriteItems.length === 0) {
      return otherGroups;
    }

    return [{ name: "Favourites", items: favouriteItems }, ...otherGroups];
  }, [searchQuery, favoritePaths, pathToMeta]);

  const toggleFavorite = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoritePaths((prev) => {
      const next = toggleFavoritePath(prev, path);
      saveFavoriteToolPaths(next);
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const outletWide =
    location.pathname === "/stopwatch" ||
    location.pathname === "/json-editor" ||
    location.pathname === "/sql-schema" ||
    location.pathname === "/gradient-builder";

  return (
    <div
      data-app-shell
      className="min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col"
    >
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 pl-2 pr-5 py-2 rounded-full flex items-center gap-2.5 text-[15px]">
            <span className="grid place-items-center size-7 rounded-full bg-mint text-stone-900">
              <Check size={14} weight="bold" />
            </span>
            {toast}
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 flex items-center px-4 sm:px-6 h-16 bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur">
        <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <NavLink
              to="/"
              className="group flex items-center gap-2.5 text-xl tracking-[-0.045em] text-stone-900 dark:text-stone-50"
            >
              <YondrLogo className="size-10 shrink-0" /> DevKit
            </NavLink>
            <div className="hidden md:flex items-center text-[15px] truncate">
              <span className="mr-2 text-stone-300 dark:text-stone-600">/</span>
              <span className="text-stone-900 dark:text-stone-100 flex items-center min-w-0">
                <span className="truncate">
                  {displayItem?.label || "Select a tool"}
                </span>
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 flex justify-center pointer-events-none">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="pointer-events-auto flex items-center gap-2.5 pl-4 pr-4 sm:pr-1.5 py-1.5 rounded-full bg-white dark:bg-stone-800 text-[15px] hover:bg-mint dark:hover:bg-mint dark:hover:text-stone-900 transition-colors duration-300"
            >
              <MagnifyingGlass size={16} />
              <span className="hidden sm:inline">Search tools</span>
              <span className="sm:hidden">Tools</span>
              <div className="hidden sm:flex items-center gap-0.5 text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-900 dark:text-stone-100">
                <Command size={12} weight="thin" />
                <span>K</span>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstall}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-stone-800 text-[15px] hover:bg-mint dark:hover:text-stone-900 transition-colors duration-300"
              >
                Install
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid place-items-center size-10 rounded-full bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:bg-mint hover:text-stone-900 dark:hover:bg-mint transition-colors duration-300"
            >
              <span className="relative flex items-center justify-center w-5 h-5 overflow-hidden">
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
                    theme === "dark" ? "translate-y-0" : "translate-y-full"
                  }`}
                >
                  <Moon size={14} />
                </span>
                <span
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
                    theme === "light" ? "translate-y-0" : "-translate-y-full"
                  }`}
                >
                  <Sun size={14} />
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-stone-900/40 z-30 transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-stone-100 dark:bg-stone-900 rounded-b-3xl transition-all duration-500 ease-out flex flex-col overflow-hidden ${
          isMenuOpen
            ? "h-[calc(100dvh-4rem)] sm:h-[60vh] opacity-100 translate-y-0"
            : "h-0 opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex-shrink-0 p-4 sm:p-6">
          <div className="relative max-w-2xl mx-auto">
            <MagnifyingGlass
              className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tools (json, color, hash)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
              className="w-full pl-12 pr-5 py-3.5 !rounded-full bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900 dark:focus:ring-mint text-base sm:text-[17px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            {displayedGroups.length === 0 ? (
              <div className="text-center py-10 text-stone-500 dark:text-stone-400">
                No utilities found matching "{searchQuery}"
              </div>
            ) : (
              displayedGroups.map((group) => (
                <div key={group.name} className="space-y-4">
                  <h3 className="text-3xl tracking-[-0.045em] text-stone-900 dark:text-stone-50">
                    {group.name}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {group.items.map((item) => {
                      const isFav = favoritePaths.includes(item.path);
                      const subtitleSource =
                        group.name === "Favourites"
                          ? pathToMeta.get(item.path)?.groupName ?? group.name
                          : group.name;
                      return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            onClick={() => {
                              beginToolNavigation(item.path);
                              localStorage.setItem("lastToolPath", item.path);
                              setIsMenuOpen(false);
                              setSearchQuery("");
                            }}
                            className={`relative flex items-start gap-3 p-4 pr-12 rounded-2xl text-left transition-colors duration-300 ${
                              location.pathname === item.path
                                ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900"
                                : "bg-white text-stone-900 dark:bg-stone-800 dark:text-stone-100 hover:bg-mint dark:hover:bg-mint dark:hover:text-stone-900"
                            }`}
                          ><button
                          type="button"
                          onClick={(e) => toggleFavorite(item.path, e)}
                          className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-stone-900/10 transition-colors"
                          aria-label={
                            isFav
                              ? "Remove from favourites"
                              : "Add to favourites"
                          }
                        >
                          <Star
                            size={16}
                            weight={isFav ? "fill" : "thin"}
                            className={
                              isFav
                                ? "text-current"
                                : "text-current opacity-40"
                            }
                          />
                        </button>
                            <div className="grid place-items-center size-9 shrink-0 rounded-full bg-stone-100 text-stone-900 dark:bg-stone-900 dark:text-stone-100">
                              <item.icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[17px] leading-tight">{item.label}</div>
                              <div className="mt-1 text-sm leading-snug opacity-65 line-clamp-2">
                                {item.description || subtitleSource}
                              </div>
                            </div>
                          </NavLink>
                          
                        
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <main
        className={`flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8 transition-all duration-500`}
      >
        <div
          className={
            outletWide ? "w-full max-w-none mx-auto" : "max-w-4xl mx-auto"
          }
        >
          <div className="relative min-h-[12rem]">
            {isToolLoading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-stone-100 dark:bg-stone-900">
                <ToolLoadingFallback label={loadingItem?.label ?? displayItem?.label} />
              </div>
            )}
            <Suspense fallback={null}>
              <ToolErrorBoundary resetKey={location.pathname}>
                <Outlet key={location.pathname} />
              </ToolErrorBoundary>
            </Suspense>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(120, 113, 108, 0.5); }
      `,
        }}
      />
    </div>
  );
}
