import { RollLink } from "@/components/ui/roll-link";

export function SiteFooter() {
  return (
    <footer className="shell relative pb-10 pt-24">
      <div className="grid-12 gap-y-6 border-t border-rule pt-6">
        <p className="t-mono col-span-12 md:col-span-4">© {new Date().getFullYear()} Sandy-SP</p>
        <p className="t-mono col-span-12 md:col-span-4">Next.js · WebGL · Schibsted Grotesk</p>
        <div className="col-span-12 flex gap-6 text-sm md:col-span-4 md:justify-end">
          <RollLink href="https://github.com/sandy-sp">GitHub</RollLink>
          <RollLink href="https://www.linkedin.com/in/sandy-sp/">LinkedIn</RollLink>
          <RollLink href="mailto:sandeep.paidipati@gmail.com">Email</RollLink>
        </div>
      </div>
    </footer>
  );
}
