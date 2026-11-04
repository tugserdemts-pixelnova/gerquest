import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// share card: logo + wordmark over the steppe sky
export const alt = "GerQuest — a 3D journey into the Mongolian ger";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TAG = "A 3D journey into the Mongolian ger";

// Nunito subset to just the text on the card (TTF, which the renderer needs); null = use the default font
async function nunito(weight: 800 | 900, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Nunito:wght@${weight}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch { return null; }
}

export default async function Image() {
  const icon = "data:image/svg+xml;base64," + (await readFile(join(process.cwd(), "src/app/icon.svg"))).toString("base64");
  const [black, bold] = await Promise.all([nunito(900, "GerQuest"), nunito(800, TAG)]);
  const fonts = [
    ...(black ? [{ name: "Nunito", data: black, weight: 900 as const }] : []),
    ...(bold ? [{ name: "Nunito", data: bold, weight: 800 as const }] : []),
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(#7fc0ec, #d9ecf2 70%, #f6f0b8)", color: "#16295a", fontFamily: "Nunito" }}>
        <img src={icon} width={180} height={180} style={{ borderRadius: 44, boxShadow: "0 14px 0 #f4c24d" }} />
        <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: -5, marginTop: 36, display: "flex" }}>
          <span>Ger</span><span style={{ color: "#c23f24" }}>Quest</span>
        </div>
        <div style={{ fontSize: 44, fontWeight: 800, marginTop: 4 }}>{TAG}</div>
      </div>
    ),
    { ...size, fonts },
  );
}
