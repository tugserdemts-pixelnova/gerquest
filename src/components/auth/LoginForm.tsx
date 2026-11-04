import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../auth/supabase";
import { useSession } from "../../auth/useSession";
import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";
import { SEASONS } from "../../data/seasons";
import Ornament from "../Ornament";
import LangSwitch from "../LangSwitch";
import SeasonSwitch from "../SeasonSwitch";
import Logo from "../Logo";
import GerSpin from "./GerSpin";

type Mode = "in" | "up";

// Supabase answers in English; show the ones people actually meet in the visitor's language
const known = (m: string) => {
  const s = m.toLowerCase();
  if (s.includes("invalid login")) return "badLogin";
  if (s.includes("already registered") || s.includes("already been registered")) return "taken";
  if (s.includes("not confirmed")) return "unconfirmed";
  if (s.includes("rate limit") || s.includes("too many")) return "tooMany";
  return null;
};

const Eye = ({ off }: { off: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);

// the steppe, a turning ger taken apart into its parts, and the email/password card: log in, or switch to creating an account
export default function LoginForm() {
  const { t, lang } = useT();
  const { season } = useGame();
  const router = useRouter(), session = useSession();
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [show, setShow] = useState(false), [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // already signed in (or just signed in): go to the game
  useEffect(() => { if (session) router.replace("/"); }, [session, router]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t(mode == "in" ? "loginT" : "signupT") + " · HOTOL";
  }, [lang, mode]);
  useEffect(() => { document.documentElement.dataset.season = season; }, [season]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 6) { setMsg({ ok: false, text: t("pwShort") }); return; }
    setBusy(true); setMsg(null);
    const { data, error } = mode == "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + "/" } });
    setBusy(false);
    if (error) { const k = known(error.message); setMsg({ ok: false, text: k ? t(k) : error.message }); }
    else if (mode == "up" && !data.session) setMsg({ ok: true, text: t("checkEmail") });
  }

  const pick = (m: Mode) => { if (m != mode) { setMode(m); setMsg(null); } };

  return (
    <main id="auth">
      <div className="abg">
        {SEASONS.map(s => (
          <img key={s} className={s == season ? "on" : ""} src={`/login/${s}.webp`} width={1920} height={1080} alt={s == season ? t("heroAlt") : ""} />
        ))}
      </div>
      <GerSpin />
      <LangSwitch />
      <SeasonSwitch />
      <section className="abr">
        <div>
          <h1><Logo size={210} /></h1>
          <p className="atag">{t("tag")}</p>
        </div>
      </section>
      <form className="ac" onSubmit={submit} aria-label={t(mode == "in" ? "loginT" : "signupT")}>
        <Ornament />
        <div className="atabs" role="group">
          {(["in", "up"] as const).map(m => (
            <button key={m} type="button" aria-pressed={m == mode} onClick={() => pick(m)}>{t(m == "in" ? "loginT" : "signupT")}</button>
          ))}
        </div>
        <p>{t(mode == "in" ? "loginSub" : "pitch")}</p>
        {!supabase && <div className="lm bad">{t("noConfig")}</div>}
        <label>
          {t("email")}
          <input type="email" autoComplete="email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          {t("password")}
          <span className="apw">
            <input type={show ? "text" : "password"} autoComplete={mode == "in" ? "current-password" : "new-password"} required minLength={6}
              value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" aria-label={t(show ? "hidePw" : "showPw")} title={t(show ? "hidePw" : "showPw")} onClick={() => setShow(!show)}><Eye off={show} /></button>
          </span>
        </label>
        {msg && <div className={"lm " + (msg.ok ? "ok" : "bad")} role="status">{msg.text}</div>}
        <button type="submit" className="btn" disabled={busy || !supabase}>
          {busy ? t("wait") : t(mode == "in" ? "signIn" : "signUp")}
        </button>
      </form>
    </main>
  );
}
