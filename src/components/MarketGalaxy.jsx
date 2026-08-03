import { Float, OrbitControls, Stars, Text } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import { marketCoins } from "../data/mockData.js";

function CoinSphere({ coin }) {
  const radius = useMemo(() => Math.max(0.45, Math.log10(coin.volume) / 5.2), [coin.volume]);
  const y = coin.change / 1.7;
  const color = coin.change >= 0 ? "#34d399" : "#fb7185";

  return (
    <Float speed={1.6} rotationIntensity={0.45} floatIntensity={0.55}>
      <group position={[coin.x, y, coin.z]}>
        <mesh>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.24} roughness={0.42} metalness={0.28} />
        </mesh>
        <Text position={[0, radius + 0.32, 0]} fontSize={0.24} color="#e2e8f0" anchorX="center" anchorY="middle">
          {coin.symbol}
        </Text>
      </group>
    </Float>
  );
}

function GalaxyScene({ coins }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[4, 6, 5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[-6, -2, -3]} intensity={1.2} color="#34d399" />
      <Stars radius={70} depth={32} count={1600} factor={4} saturation={0} fade speed={0.6} />
      {coins.map((coin) => (
        <CoinSphere key={coin.symbol} coin={coin} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.7, 0]}>
        <ringGeometry args={[2.4, 6.8, 96]} />
        <meshBasicMaterial color="#1e293b" transparent opacity={0.36} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={6} maxDistance={16} />
    </>
  );
}

export default function MarketGalaxy({ coins = marketCoins }) {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded border border-line bg-slate-950 shadow-glow md:h-[480px]">
      <Canvas camera={{ position: [0, 4.2, 10], fov: 54 }}>
        <Suspense fallback={null}>
          <GalaxyScene coins={coins} />
        </Suspense>
      </Canvas>
    </div>
  );
}
