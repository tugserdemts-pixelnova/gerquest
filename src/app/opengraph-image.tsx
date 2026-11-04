import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// share card: the logo over the steppe sky
export const alt = "HOTOL — a 3D journey into the Mongolian ger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAG = "A 3D journey into the Mongolian ger";

// Nunito subset to just the text on the card (TTF, which the renderer needs); null = use the default font
async function nunito(weight: 800, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Nunito:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch { return null; }
}

export default async function Image() {
  const logo = "data:image/png;base64," + (await readFile(join(process.cwd(), "public/logo.png"))).toString("base64");
  const bold = await nunito(800, TAG);
  const fonts = bold ? [{ name: "Nunito", data: bold, weight: 800 as const }] : [];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(#7fc0ec, #d9ecf2 70%, #f6f0b8)", color: "#16295a", fontFamily: "Nunito" }}>
        <img src={logo} width={430} height={430} />
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 28 }}>{TAG}</div>
      </div>
    ),
    { ...size, fonts },
  );
}
