import { notFound } from "next/navigation";

// Internal tools are not part of the public site. Hidden until they have
// proper sign-in and move to HQ.
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout() {
  notFound();
}
