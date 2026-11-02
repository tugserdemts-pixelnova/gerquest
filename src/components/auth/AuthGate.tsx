import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../auth/useSession";

// shows children only to signed-in visitors; everyone else is sent to /login
export default function AuthGate({ children }: { children: ReactNode }) {
  const session = useSession(), router = useRouter();
  useEffect(() => { if (session === null) router.replace("/login"); }, [session, router]);
  return session ? <>{children}</> : null;
}
