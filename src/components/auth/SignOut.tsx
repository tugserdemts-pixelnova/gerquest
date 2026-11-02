import { supabase } from "../../auth/supabase";
import { useGame } from "../../game/store";
import { useT } from "../../game/hooks";

// small "log out" pill under the language switch; hidden while a card or build mode is open
export default function SignOut() {
  const { panel, bm } = useGame();
  const { t } = useT();
  if (!supabase || panel || bm.on) return null;
  return <button type="button" id="so" onClick={() => supabase!.auth.signOut()}>{t("signOut")}</button>;
}
