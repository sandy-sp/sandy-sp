import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";
import { JourneyView } from "@/components/journey/journey-view";
import { Certifications } from "@/components/journey/certifications";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Sandy SP's path from QA and full-stack work in Hyderabad to AI engineering in the US, with degrees in psychology, electrical engineering and information systems.",
};

export default function JourneyPage() {
  return (
    <>
      <PageHeader
        scene="globeIntro"
        eyebrow="Journey · 2016 — now"
        title="Ten years, two countries."
        lead="Three degrees, seven roles. Psychology taught me how people decide. Electrical engineering taught me systems. Information systems taught me how organizations run on data. Scroll to follow the route."
      />
      <JourneyView />
      <Certifications />
      <section className="shell">
        <div className="flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
          <p className="t-lead">Want the details behind any of this?</p>
          <RollLink href="/#contact" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
            Get in touch
          </RollLink>
        </div>
      </section>
    </>
  );
}
