import Link from "next/link";

/**
 * One-line "who this form is for" note shown above a form, with a link to the
 * right place for everyone else. Keeps people from filling out the wrong form.
 */
export default function FormRouteNote({
  children,
  href,
  linkLabel,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  linkLabel: string;
  className?: string;
}) {
  return (
    <p className={`text-sm text-fg-muted leading-relaxed ${className}`.trim()}>
      {children}{" "}
      <Link href={href} className="text-accent-text font-semibold underline underline-offset-2">
        {linkLabel}
      </Link>
    </p>
  );
}
