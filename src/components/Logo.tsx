// the HOTOL logo. Plain <img>: it is one small file, used on pages that render in the browser
export default function Logo({ size = 48, alt = "HOTOL" }: { size?: number; alt?: string }) {
  return <img className="logo" src="/logo.webp" width={size} height={size} alt={alt} />;
}
