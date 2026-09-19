import Hero from "@/components/home/Hero";
import ServiceInfo from "@/components/home/ServiceInfo";
import SermonBand from "@/components/home/SermonBand";
import PhotoStrip from "@/components/home/PhotoStrip";
import MinistriesSection from "@/components/home/MinistriesSection";
import ConnectBand from "@/components/home/ConnectBand";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiceInfo />
      <SermonBand />
      <PhotoStrip />
      <MinistriesSection />
      <ConnectBand />
    </main>
  );
}
