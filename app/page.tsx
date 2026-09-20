import Hero from "@/components/home/Hero";
import ServiceInfo from "@/components/home/ServiceInfo";
import SermonBand from "@/components/home/SermonBand";
import ThisWeek from "@/components/home/ThisWeek";
import StatsStrip from "@/components/home/StatsStrip";
import PhotoStrip from "@/components/home/PhotoStrip";
import MinistriesSection from "@/components/home/MinistriesSection";
import ConnectBand from "@/components/home/ConnectBand";

export default function Home() {
  return (
    <main>
      <Hero />
      <ServiceInfo />
      <SermonBand />
      <ThisWeek />
      <StatsStrip />
      <PhotoStrip />
      <MinistriesSection />
      <ConnectBand />
    </main>
  );
}
