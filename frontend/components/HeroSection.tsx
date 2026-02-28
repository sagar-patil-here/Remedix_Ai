import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn("pt-24 pb-16 sm:pt-32 sm:pb-24", className)}>
      <div className="container-padded">
        <div className="mx-auto max-w-4xl text-center">
          <FadeIn>
            <div className="mx-auto inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Health-grade clarity, designed minimal.</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
              Your Personal <br className="hidden sm:block" /> AI Pharmacist.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
              Upload your prescription. Get clarity, find generics, compare prices, and stay on track with smart reminders in seconds.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignedIn>
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/upload" className="inline-flex items-center gap-2">
                    Analyze Prescription
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button asChild size="lg" className="h-12 px-8 text-base">
                  <Link href="/upload" className="inline-flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base bg-muted text-foreground hover:bg-muted/80 border-none">
                  <Link href="/#features">Learn More</Link>
                </Button>
              </SignedOut>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="mx-auto mt-16 max-w-5xl rounded-xl border bg-card p-2 shadow-cal-md ring-1 ring-border/50">
            <div className="grid divide-y border-border md:grid-cols-3 md:divide-x md:divide-y-0 text-left">
              <div className="flex flex-col gap-2 p-8">
                <div className="text-base font-semibold text-foreground">AI Interpretation</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Powered by Gemini 2.0 Flash for accurate handwriting recognition and data extraction.
                </div>
              </div>
              <div className="flex flex-col gap-2 p-8">
                <div className="text-base font-semibold text-foreground">Smart Savings</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Find generic alternatives and compare prices across top vendors instantly.
                </div>
              </div>
              <div className="flex flex-col gap-2 p-8">
                <div className="text-base font-semibold text-foreground">Connected Health</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Sync schedules with Google Calendar, Telegram, and listen in your language.
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
