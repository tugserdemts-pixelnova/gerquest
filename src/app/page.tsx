"use client";

import dynamic from "next/dynamic";

// the whole game runs in the browser (WebGL, window size, localStorage), so skip server rendering
const App = dynamic(() => import("../App"), { ssr: false });

export default function Page() {
  return <App />;
}
