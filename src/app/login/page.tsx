"use client";

import dynamic from "next/dynamic";

// client-only, like the game: the language choice and the session live in browser storage
const LoginForm = dynamic(() => import("../../components/auth/LoginForm"), { ssr: false });

export default function LoginPage() {
  return <LoginForm />;
}
