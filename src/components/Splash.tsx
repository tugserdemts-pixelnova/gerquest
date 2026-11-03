import Logo from "./Logo";
import Wordmark from "./Wordmark";

// full-screen placeholder while the session is read or the 3D scene loads; no text that needs a language
export default function Splash() {
  return (
    <div id="splash" role="status" aria-label="GerQuest">
      <Logo size={84} />
      <Wordmark />
      <div className="dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}
