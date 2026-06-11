import { DecoderName } from "@/components/decoder-name";
import { ParticleSphereLoader } from "@/components/particle-sphere-loader";

export default function Home() {
  return (
    <main className="home-shell">
      <ParticleSphereLoader />
      <DecoderName />
    </main>
  );
}
