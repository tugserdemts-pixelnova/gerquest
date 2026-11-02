import { useEffect, useRef } from "react";
import { initEngine } from "../three/engine";

// full-screen WebGL canvas; the engine owns it after mount
export default function Scene() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) initEngine(ref.current); }, []);
  return <canvas id="c" ref={ref} />;
}
