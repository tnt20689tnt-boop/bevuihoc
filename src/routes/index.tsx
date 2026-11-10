import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { EntranceGate } from "@/game/CampusArchitecture";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cổng trường – Bé Học Vui" },
      { name: "description", content: "Cổng trường Bé Học Vui." },
    ],
  }),
  component: SchoolEntrancePage,
});

function SchoolEntrancePage() {
  return (
    <main className="relative h-screen min-h-[520px] w-full overflow-hidden bg-[#bfe8f7]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 5.5, 17], fov: 43, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#bfe8f7"]} />
        <fog attach="fog" args={["#bfe8f7", 35, 75]} />
        <ambientLight intensity={1.35} />
        <hemisphereLight args={["#f7fbff", "#8a9c68", 1.1]} />
        <directionalLight
          position={[-8, 16, 10]}
          intensity={2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#86bd76" roughness={0.96} />
        </mesh>
        <group position={[0, 0, -1]} scale={1.12}>
          <EntranceGate />
        </group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 7]} receiveShadow>
          <planeGeometry args={[12, 20]} />
          <meshStandardMaterial color="#f2dfbd" roughness={0.95} />
        </mesh>
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-slate-900/35 to-transparent px-5 pb-8 pt-24">
        <Link
          to="/auth"
          className="pointer-events-auto rounded-full border-4 border-white bg-emerald-600 px-10 py-4 text-xl font-black text-white shadow-[0_7px_0_#216342,0_12px_28px_#0004] transition hover:-translate-y-1 hover:bg-emerald-700 active:translate-y-1"
        >
          VÀO TRƯỜNG →
        </Link>
      </div>
    </main>
  );
}
