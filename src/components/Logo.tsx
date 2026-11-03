// GerQuest mark: a ger with a gold toono on a navy tile (same drawing as app/icon.svg)
export default function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg className="logo" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#23285e" />
      <path d="M9 33 C17 22 25 17.5 32 17.5 S47 22 55 33 Z" fill="#fff6e2" />
      <rect x="12" y="33" width="40" height="15" fill="#fff6e2" />
      <path d="M12 36.5H52M12 44.5H52" stroke="#23285e" strokeWidth="1.6" />
      <rect x="27.5" y="35" width="9" height="13" rx="1" fill="#d9531e" />
      <ellipse cx="32" cy="18.5" rx="6" ry="2.6" fill="#f2c35b" />
      <path d="M8 51H56" stroke="#f2c35b" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
