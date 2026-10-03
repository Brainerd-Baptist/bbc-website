import type { HTMLAttributes } from "react";

/**
 * Standard page section. Pass spacing through className, e.g. "py-24 px-6".
 *
 * The frosted-glass backdrop is NOT per section: one fixed colour layer
 * (.bx-backdrop, rendered in ConditionalLayout) sits behind the whole site,
 * so cards scroll over it. Don't add overflow-hidden here, it would clip the
 * cards' shadows and hover lift.
 */
export default function Section({ className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return <section className={`relative ${className}`.trim()} {...rest} />;
}
