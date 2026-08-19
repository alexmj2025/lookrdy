"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";
import "./landing.css";

import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { StillYou } from "@/components/landing/StillYou";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CompleteLook } from "@/components/landing/CompleteLook";
import { Occasions } from "@/components/landing/Occasions";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    track("landing");
  }, []);

  return (
    <div className="lnd">
      <Nav />
      <main>
        <Hero />
        <StillYou />
        <HowItWorks />
        <CompleteLook />
        <Occasions />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
