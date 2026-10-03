import type { ElementType, HTMLAttributes } from "react";

/**
 * Frosted glass card. The one place the card look is applied, so a new page
 * uses <Card> instead of hand-writing "glass-frost rounded-2xl ...".
 *
 *   lift   hover lift. Use for cards that are links (or contain one).
 *   lite   no blur, frosted look only. Use inside long lists for performance.
 *   as     change the tag, default "div".
 *
 * Glass needs colour behind it: the site-wide fixed .bx-backdrop provides it, so
 * cards just work on any page. See docs/glass-system.md.
 */
type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  lift?: boolean;
  lite?: boolean;
};

export default function Card({
  as: Tag = "div",
  lift = false,
  lite = false,
  className = "",
  ...rest
}: CardProps) {
  const cls = ["glass-frost", lift ? "" : "glass-static", lite ? "glass-lite" : "", className]
    .filter(Boolean)
    .join(" ");
  return <Tag className={cls} {...rest} />;
}
