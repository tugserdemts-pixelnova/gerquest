import Logo from "./Logo";

// full-screen placeholder while the session is read or the 3D scene loads; no text that needs a language
export default function Splash() {
  return (
    <div id="splash" role="status" aria-label="HOTOL">
      <Logo size={132} alt="" />
      <div className="dots" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}
