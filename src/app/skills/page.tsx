import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";
import { StackDeck } from "@/components/stack/stack-deck";

export const metadata: Metadata = {
  title: "Stack",
  description: "The tools Sandy-SP uses for AI systems, backends, cloud and front ends.",
};

export default function StackPage() {
  return (
    <>
      <PageHeader
        scene="stackIntro"
        eyebrow="Stack · 4 layers"
        title="What I reach for."
        lead="Python and TypeScript most days. The model is rarely the hard part; retrieval, orchestration, infrastructure and evaluation usually are."
      />

      <StackDeck />

      <section className="shell pt-16 md:pt-24">
        <div className="flex flex-col gap-4 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
          <p className="t-lead">See these tools used in real projects.</p>
          <RollLink href="/work" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
            View work
          </RollLink>
        </div>
      </section>
    </>
  );
}
