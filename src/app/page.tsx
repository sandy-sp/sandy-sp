import { DecoderName } from "@/components/home/decoder-name";
import { HomeAiFields } from "@/components/home/home-ai-fields";
import { HomeBio } from "@/components/home/home-bio";
import { HomeNavOverlay } from "@/components/shared/home-nav-overlay";
import { HomeSocial } from "@/components/home/home-social";
import { HomeWhisper } from "@/components/home/home-whisper";

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
