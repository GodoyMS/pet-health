import { AiSpotlightSection } from "../components/AiSpotlightSection";
import { FeaturesSection } from "../components/FeaturesSection";
import { FinalCtaSection } from "../components/FinalCtaSection";
import { HeroSection } from "../components/HeroSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { LandingFooter } from "../components/LandingFooter";
import { LandingNav } from "../components/LandingNav";
import { ProblemSection } from "../components/ProblemSection";
import { SocialProofSection } from "../components/SocialProofSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { VideoSection } from "../components/VideoSection";
import "../styles/landing.css";

export function LandingPage() {
  return (
    <div id="top" className="landing min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        Skip to main content
      </a>
      <LandingNav />
      <div>
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <FeaturesSection />
        <VideoSection />
        <HowItWorksSection />
        <AiSpotlightSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </div>
      <LandingFooter />
    </div>
  );
}
