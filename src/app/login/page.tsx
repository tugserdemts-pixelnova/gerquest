"use client";

import dynamic from "next/dynamic";
import Splash from "../../components/Splash";

// client-only, like the game: the language choice and the session live in browser storage
const LoginForm = dynamic(() => import("../../components/auth/LoginForm"), { ssr: false, loading: Splash });

export default function LoginPage() {
  return <LoginForm />;
}
