import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
  children: string;
  className?: string;
  /** Extra content after the rolling label (e.g. an arrow). Not rolled. */
  suffix?: ReactNode;
};

/** Text link whose letters roll up into an ember copy, with an underline wipe. */
export function RollLink({ children, className = "", suffix, ...props }: Props) {
  const external = typeof props.href === "string" && /^(https?:|mailto:)/.test(props.href);
  const inner = (
    <>
      <span className="roll-clip">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {suffix}
    </>
  );

  if (external) {
    const { href, ...rest } = props;
    return (
      <a
        href={href as string}
        className={`roll ${className}`}
        target={String(href).startsWith("http") ? "_blank" : undefined}
        rel={String(href).startsWith("http") ? "noopener noreferrer" : undefined}
        {...(rest as ComponentProps<"a">)}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link className={`roll ${className}`} {...props}>
      {inner}
    </Link>
  );
}
