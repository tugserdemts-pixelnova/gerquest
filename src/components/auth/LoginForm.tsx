import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../auth/supabase";
import { useSession } from "../../auth/useSession";
import { useT } from "../../game/hooks";
import Ornament from "../Ornament";
import LangSwitch from "../LangSwitch";

// email + password card: log in, or switch to creating an account
export default function LoginForm() {
  const { t } = useT();
  const router = useRouter(), session = useSession();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // already signed in (or just signed in): go to the game
  useEffect(() => { if (session) router.replace("/"); }, [session, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (password.length < 6) { setMsg({ ok: false, text: t("pwShort") }); return; }
    setBusy(true); setMsg(null);
    const { data, error } = mode == "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + "/" } });
    setBusy(false);
    if (error) setMsg({ ok: false, text: error.message });
    else if (mode == "up" && !data.session) setMsg({ ok: true, text: t("checkEmail") });
  }

  const flip = () => { setMode(mode == "in" ? "up" : "in"); setMsg(null); };

  return (
    <main id="login">
      <LangSwitch />
      <form className="lc" onSubmit={submit}>
        <Ornament />
        <span className="no">🛖 {t("h1")}</span>
        <h2>{t(mode == "in" ? "loginT" : "signupT")}</h2>
        <p>{t("loginSub")}</p>
        {!supabase && <div className="lm bad">{t("noConfig")}</div>}
        <label>
          {t("email")}
          <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label>
          {t("password")}
          <input type="password" autoComplete={mode == "in" ? "current-password" : "new-password"} required minLength={6}
            value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        {msg && <div className={"lm " + (msg.ok ? "ok" : "bad")} role="status">{msg.text}</div>}
        <button type="submit" className="btn" disabled={busy || !supabase}>
          {busy ? t("wait") : t(mode == "in" ? "signIn" : "signUp")}
        </button>
        <button type="button" className="lk" onClick={flip}>{t(mode == "in" ? "toSignUp" : "toSignIn")}</button>
      </form>
    </main>
  );
}
