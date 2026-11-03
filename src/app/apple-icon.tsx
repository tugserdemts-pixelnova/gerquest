import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// home-screen icon: the same mark as icon.svg, full-bleed (iOS rounds the corners itself)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const icon = "data:image/svg+xml;base64," + (await readFile(join(process.cwd(), "src/app/icon.svg"))).toString("base64");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#23285e" }}>
        <img src={icon} width={180} height={180} />
      </div>
    ),
    size,
  );
}
