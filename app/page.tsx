import Hero from "@/components/home/Hero";
import ServiceInfo from "@/components/home/ServiceInfo";
import SermonBand from "@/components/home/SermonBand";
import MinistriesSection from "@/components/home/MinistriesSection";
import ConnectBand from "@/components/home/ConnectBand";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiceInfo />
      <SermonBand />
      <MinistriesSection />
      <ConnectBand />
    </main>
  );
}
