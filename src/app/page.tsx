"use client";

import dynamic from "next/dynamic";
import Splash from "../components/Splash";

// the whole game runs in the browser (WebGL, window size, localStorage), so skip server rendering
const App = dynamic(() => import("../App"), { ssr: false, loading: Splash });
const AuthGate = dynamic(() => import("../components/auth/AuthGate"), { ssr: false, loading: Splash });

export default function Page() {
  return <AuthGate><App /></AuthGate>;
}
