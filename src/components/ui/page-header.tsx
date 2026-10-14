import type { ReactNode } from "react";
import { RevealText } from "@/components/motion/reveal";
import type { SceneName } from "@/components/scene/scene-state";

/** Inner-page opener: mono eyebrow, display title, lead. */
type Props = {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  /** Scene state while the header is in view. */
  scene?: SceneName;
  part?: number;
};

export function PageHeader({ eyebrow, title, lead, children, scene = "page", part }: Props) {
  return (
    <header data-scene={scene} data-part={part} className="shell grid-12 gap-y-10 pb-20 pt-40 md:pb-28 md:pt-52">
      <RevealText as="p" immediate className="t-mono col-span-12">
        {eyebrow}
      </RevealText>
      <RevealText as="h1" immediate delay={0.08} className="t-display-1 col-span-12 md:col-span-8 lg:col-span-7">
        {title}
      </RevealText>
      {lead && (
        <RevealText as="p" immediate delay={0.3} className="t-lead col-span-12 text-ash md:col-span-7">
          {lead}
        </RevealText>
      )}
      {children}
    </header>
  );
}
