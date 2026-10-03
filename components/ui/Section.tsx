import type { HTMLAttributes } from "react";

/**
 * Page section with the frosted-glass backdrop built in. Renders a <section>
 * with the soft color bloom behind its content, so cards inside have
 * something to blur. Pass spacing through className, e.g. "py-24 px-6".
 */
export default function Section({
  className = "",
  children,
  ...rest
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={`relative overflow-hidden isolate ${className}`.trim()} {...rest}>
      <div className="bx-bloom bx-bloom-under" aria-hidden="true" />
      {children}
    </section>
  );
}
