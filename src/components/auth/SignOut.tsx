import { supabase } from "../../auth/supabase";
import { useGame } from "../../game/store";
import { resetProgress } from "../../game/actions";
import { useT } from "../../game/hooks";

// small "log out" pill under the language switch; hidden while a card or build mode is open
export default function SignOut() {
  const { panel, bm } = useGame();
  const { t } = useT();
  if (!supabase || panel || bm.on) return null;
  return <button type="button" id="so" onClick={() => { resetProgress(); void supabase!.auth.signOut(); }}>{t("signOut")}</button>;
}
