import { CERTIFICATIONS } from "@/data/experience";
import { Reveal, RevealText } from "@/components/motion/reveal";

export function Certifications() {
  return (
    <section data-scene="aside" className="section shell">
      <div className="grid-12 mb-12 items-end gap-y-6 md:mb-16">
        <RevealText as="h2" className="t-display-2 col-span-12 md:col-span-8">
          Certifications
        </RevealText>
        <p className="t-mono col-span-12 md:col-span-4 md:text-right">{CERTIFICATIONS.length} completed</p>
      </div>
      <Reveal as="ul" stagger className="border-b border-rule">
        {CERTIFICATIONS.map((c) => {
          const body = (
            <>
              <span className="col-span-12 font-medium md:col-span-6">
                <span className="row-name">{c.title}</span>
              </span>
              <span className="col-span-7 mt-1 text-ash md:col-span-3 md:mt-0">{c.issuer}</span>
              <span className="t-mono col-span-5 mt-1 flex justify-end gap-4 md:col-span-3 md:mt-0">
                {c.date}
                <span className={c.verifyUrl ? "row-arrow" : "invisible"} aria-hidden="true">↗</span>
              </span>
            </>
          );
          return (
            <li key={c.title}>
              {c.verifyUrl ? (
                <a
                  href={c.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="row group"
                  aria-label={`${c.title}, ${c.issuer}, ${c.date}. Verify credential (opens in new tab)`}
                >
                  {body}
                </a>
              ) : (
                <div className="row">{body}</div>
              )}
            </li>
          );
        })}
      </Reveal>
      <p className="t-mono mt-6">Links open the issuer&apos;s verification page.</p>
    </section>
  );
}
