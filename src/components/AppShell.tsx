"use client";

import { useTranslations } from "next-intl";
import { NavIcon, type NavKey } from "@/components/glyphs";
import { useEffect, useMemo, type ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { shouldHideTabbar, shouldHideTopbar } from "@/lib/chrome";
import { levelFromXp } from "@/lib/xp";
import { useProgress } from "@/lib/useProgress";

interface AppShellProps {
  children: ReactNode;
  locale: string;
}

function isTabOn(href: "/learn" | "/hub" | "/exam" | "/drive" | "/settings", pathname: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  return href === "/learn" && pathname.startsWith("/lesson");
}

export function AppShell({ children, locale }: AppShellProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const xp = useProgress((state) => state.xp);
  const days = useProgress((state) => state.drivingDays);
  const mode = useProgress((state) => state.attentionMode);
  const setMode = useProgress((state) => state.setAttentionMode);
  const togglePause = useProgress((state) => state.togglePauseDays);
  const onboarded = useProgress((state) => state.onboardingComplete);
  const level = levelFromXp(xp);
  const play = mode === "play";
  const hideTopbar = shouldHideTopbar(onboarded);
  const hideTabbar = shouldHideTabbar(onboarded, pathname);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  const locales = useMemo(
    () =>
      [
        { id: "en", label: "EN" },
        { id: "pl", label: "PL" },
        { id: "ru", label: "RU" },
      ] as const,
    [],
  );

  const nav: ReadonlyArray<{ id: NavKey; href: "/learn" | "/hub" | "/exam" | "/drive" | "/settings"; label: string }> = [
    { id: "learn", href: "/learn", label: t("learn") },
    { id: "hub", href: "/hub", label: t("hub") },
    { id: "exam", href: "/exam", label: t("exam") },
    { id: "drive", href: "/drive", label: t("drive") },
    { id: "settings", href: "/settings", label: t("settings") },
  ];

  return (
    <div className={`${play ? "theme-play" : "theme-focus"} ${mode === "focus" ? "sygnal-focus" : ""} shell ${hideTabbar ? "shell-immersive" : ""}`}>
      {hideTopbar ? null : (
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="wordmark">
              {t("appName")}
            </Link>
            <div className="status-row">
              <span className="xp-pill">
                <span aria-hidden="true">✦</span>
                {t("xp")} {xp} · {level}
              </span>
              <span className="days-pill">
                <span aria-hidden="true">◎</span>
                {t("days")} {days.paused ? "—" : days.count}
              </span>
              <button type="button" className="chip" onClick={() => setMode(play ? "focus" : "play")}>
                {play ? t("focus") : t("play")}
              </button>
            </div>
          </div>
        </header>
      )}
      <main className="canvas">{children}</main>
      <footer className="colophon">
        <p>{t("disclaimer")}</p>
        <div className="chip-row chip-row-center">
          {locales.map((item) => (
            <Link
              key={item.id}
              href={pathname || "/"}
              locale={item.id}
              className={`chip ${item.id === locale ? "chip-on" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          {hideTopbar ? null : (
            <button type="button" className="chip" onClick={togglePause}>
              {days.paused ? t("resumeDays") : t("pauseDays")}
            </button>
          )}
        </div>
      </footer>
      {hideTabbar ? null : (
        <nav className="tabbar">
          <div className="tabbar-inner">
            {nav.map((item) => (
              <Link
                key={item.href}
                className={`tab ${isTabOn(item.href, pathname) ? "tab-on" : ""}`}
                href={item.href}
              >
                <NavIcon name={item.id} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
