// the HOTOL logo. Plain <img>: it is one small file, used on pages that render in the browser
export default function Logo({ size = 48, alt = "HOTOL", src = "/logo.webp" }: { size?: number; alt?: string; src?: string }) {
  return <img className="logo" src={src} width={size} height={size} alt={alt} />;
}
