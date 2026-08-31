"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { levelFromXp } from "@/lib/xp";
import { useProgress } from "@/lib/useProgress";

interface AppShellProps {
  children: React.ReactNode;
  locale: string;
}

export function AppShell({ children, locale }: AppShellProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const xp = useProgress((state) => state.xp);
  const days = useProgress((state) => state.drivingDays);
  const mode = useProgress((state) => state.attentionMode);
  const setMode = useProgress((state) => state.setAttentionMode);
  const togglePause = useProgress((state) => state.togglePauseDays);
  const level = levelFromXp(xp);
  const play = mode === "play";

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

  const nav = [
    { href: "/learn", label: t("learn") },
    { href: "/hub", label: t("hub") },
    { href: "/exam", label: t("exam") },
    { href: "/drive", label: t("drive") },
    { href: "/settings", label: t("settings") },
  ] as const;

  return (
    <div className={`${play ? "theme-play" : "theme-focus"} ${mode === "focus" ? "sygnal-focus" : ""} shell`}>
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/" className="wordmark">
            {t("appName")}
          </Link>
          <div className="status-row">
            <span className="xp-pill">
              {t("xp")} {xp} · {level}
            </span>
            <span className="days-pill">
              {t("days")} {days.paused ? "—" : days.count}
            </span>
            <button type="button" className="chip" onClick={() => setMode(play ? "focus" : "play")}>
              {play ? t("focus") : t("play")}
            </button>
          </div>
        </div>
      </header>
      <main className="canvas">{children}</main>
      <nav className="tabbar">
        <div className="tabbar-inner">
          {nav.map((item) => (
            <Link
              key={item.href}
              className={`tab ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? "tab-on" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <footer className="colophon">
        <p>{t("disclaimer")}</p>
        <div className="chip-row chip-row-center">
          {locales.map((item) => (
            <Link
              key={item.id}
              href="/"
              locale={item.id}
              className={`chip ${item.id === locale ? "chip-on" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <button type="button" className="chip" onClick={togglePause}>
            {days.paused ? t("resumeDays") : t("pauseDays")}
          </button>
        </div>
      </footer>
    </div>
  );
}
