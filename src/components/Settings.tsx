import { useEffect, useRef, useState } from "react";
import { setSeason, useGame } from "../game/store";
import { useT } from "../game/hooks";
import { SEASONS } from "../data/seasons";
import LangSwitch from "./LangSwitch";

const ICON = { spring: "🌸", summer: "☀️", autumn: "🍂", winter: "❄️" };

// gear button and its menu. It stays open while you pick, so a new season can be seen taking effect behind it.
// Pages with no scene to change leave the seasons out
export default function Settings({ seasons = true }: { seasons?: boolean }) {
  const { season } = useGame();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null), gear = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    // caught first, so Escape only closes this menu and does not also skip the guest story
    const key = (e: KeyboardEvent) => { if (e.key == "Escape") { e.stopPropagation(); setOpen(false); gear.current?.focus(); } };
    addEventListener("pointerdown", away);
    addEventListener("keydown", key, true);
    return () => { removeEventListener("pointerdown", away); removeEventListener("keydown", key, true); };
  }, [open]);

  return (
    <div id="cfg" ref={box}>
      <button type="button" className="gear" ref={gear} aria-label={t("settings")} title={t("settings")} aria-expanded={open} onClick={() => setOpen(!open)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9" />
          <circle cx="12" cy="12" r="6.6" />
        </svg>
      </button>
      {open && (
        <section aria-label={t("settings")}>
          <h2>{t("settings")}</h2>
          <h3>{t("lang")}</h3>
          <LangSwitch />
          {seasons && <h3>{t("season")}</h3>}
          {seasons && (
            <div id="ssn" role="group" aria-label={t("season")}>
              {SEASONS.map(s => (
                <button key={s} type="button" data-s={s} aria-pressed={s == season} onClick={() => { if (s != season) setSeason(s); }}>
                  <span aria-hidden="true">{ICON[s]}</span>{t(s)}
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
