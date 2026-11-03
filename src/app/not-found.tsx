"use client";

import dynamic from "next/dynamic";

// client-only: the language choice lives in browser storage
const NotFound = dynamic(() => import("../components/NotFound"), { ssr: false });

export default function NotFoundPage() {
  return <NotFound />;
}
