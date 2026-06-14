import { DecoderName } from "@/components/decoder-name";
import { HomeAiFields } from "@/components/home-ai-fields";
import { HomeBio } from "@/components/home-bio";
import { HomeNavOverlay } from "@/components/home-nav-overlay";
import { HomeSocial } from "@/components/home-social";
import { HomeWhisper } from "@/components/home-whisper";

export default function Home() {
  return (
    <main className="home-shell">
      <DecoderName />
      <HomeNavOverlay />
      <HomeWhisper />
      <HomeBio />
      <HomeAiFields />
      <HomeSocial />
    </main>
  );
}
