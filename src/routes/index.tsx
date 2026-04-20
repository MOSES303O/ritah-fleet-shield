import { createFileRoute } from "@tanstack/react-router";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhyNow from "@/components/WhyNow";
import Features from "@/components/Features";
import Dashboards from "@/components/Dashboards";
import CTA from "@/components/CTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ritah — The NTSA Instant Fine Shield for Kenyan Fleets" },
      {
        name: "description",
        content:
          "Ritah uses blockchain liability delegation to protect car-hire companies from NTSA's 7-day automated fines. Shield your logbooks, insurance, and bottom line.",
      },
      { property: "og:title", content: "Ritah — The NTSA Instant Fine Shield" },
      {
        property: "og:description",
        content:
          "Blockchain-automated liability delegation for Kenyan car-hire fleets facing NTSA's instant fine system.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen">
      <Nav />
      <Hero />
      <WhyNow />
      <Features />
      <Dashboards />
      <CTA />
    </main>
  );
}
