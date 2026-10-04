"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// Opacity-only on purpose — NOT a y/x slide. Framer Motion sets an inline
// `transform` on a motion.div for the whole time any transform-based value
// (x, y, scale, …) is in play, including at rest once the animation settles.
// Because this component wraps every single page's entire content (it's
// Next.js's App Router `template.tsx`), that transform becomes a new CSS
// containing block for every `position: fixed` and `position: sticky`
// descendant on the site — found 2026-10-04 from live-service reports on
// /live: the notes toolbar's `position: sticky; top: 0` (SermonNotes.tsx)
// silently stopped sticking, and ScripturePopup's `position: fixed; inset: 0`
// stopped centering on the viewport and instead filled/centered within this
// wrapper's own (much taller) content box. A transform on an ancestor doesn't
// break fixed/sticky positioning per spec, but it does in real browsers —
// this is a well-documented practical gotcha, not a per-spec one. Dropping
// the `y` slide and animating opacity alone means Framer never writes a
// `transform` style here at all, which removes the containing block and
// fixes every fixed/sticky element site-wide — not just /live. The visual
// difference is a plain fade instead of fade+8px-rise, which is barely
// perceptible next to what it fixes.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
