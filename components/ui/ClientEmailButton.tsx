"use client"
import dynamic from "next/dynamic"

// This wrapper is a Client Component, which is required for dynamic() with ssr: false.
// The Server Component page (speakers/[slug]/page.tsx) imports this instead of using
// dynamic() directly, since dynamic(ssr:false) is not allowed in Server Components.
const EmailButton = dynamic(() => import("./EmailButton"), { ssr: false })

export default function ClientEmailButton({
  email,
  name,
}: {
  email: string
  name: string
}) {
  return <EmailButton email={email} name={name} />
}
