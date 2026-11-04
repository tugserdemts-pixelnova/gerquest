import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOTOL — Монгол гэрийн 3D аялал",
    short_name: "HOTOL",
    description: "Explore every part of a Mongolian ger in 3D, answer questions to collect them, then build the ger yourself.",
    start_url: "/",
    display: "standalone",
    background_color: "#bfe0ee",
    theme_color: "#16295a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
