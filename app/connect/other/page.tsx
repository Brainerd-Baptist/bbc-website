import { Suspense } from "react";
import OtherContactClient from "./OtherContactClient";

export const metadata = { title: "Get in Touch — Brainerd Baptist Church" };

export default function OtherContactPage() {
  return (
    <Suspense fallback={null}>
      <OtherContactClient />
    </Suspense>
  );
}
