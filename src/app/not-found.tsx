import { PageHeader } from "@/components/ui/page-header";
import { RollLink } from "@/components/ui/roll-link";

export default function NotFound() {
  return (
    <PageHeader eyebrow="404" title="Nothing here." lead="The page moved or never existed.">
      <div className="col-span-12">
        <RollLink href="/" className="text-lg font-medium" suffix={<span className="ml-2">→</span>}>
          Back to home
        </RollLink>
      </div>
    </PageHeader>
  );
}
