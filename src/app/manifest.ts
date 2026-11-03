import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GerQuest — Монгол гэрийн 3D аялал",
    short_name: "GerQuest",
    description: "Explore every part of a Mongolian ger in 3D, answer questions to collect them, then build the ger yourself.",
    start_url: "/",
    display: "standalone",
    background_color: "#bfe0ee",
    theme_color: "#23285e",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
