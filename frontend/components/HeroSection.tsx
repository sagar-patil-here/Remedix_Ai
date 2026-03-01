import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn("relative pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden", className)}>
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-radial-gradient from-primary/5 to-transparent blur-[80px]" />
      </div>

      <div className="container-padded relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left max-w-2xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI-powered • Health-grade • Secure</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl leading-[1.1]">
                Your Personal <br />
                <span className="text-primary italic">AI Pharmacist.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mt-8 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Elevate your healthcare clarity. Upload any prescription to unlock instant analysis, generic alternatives, and smart medication tracking.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <SignedIn>
                  <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-premium hover:scale-[1.02] transition-transform">
                    <Link href="/upload" className="inline-flex items-center gap-2">
                      Analyze Prescription
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-2 hover:bg-muted/50 transition-colors">
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </SignedIn>
                <SignedOut>
                  <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-premium hover:scale-[1.02] transition-transform">
                    <Link href="/upload" className="inline-flex items-center gap-2">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-2 hover:bg-muted/50 transition-colors">
                    <Link href="/#features">See How it Works</Link>
                  </Button>
                </SignedOut>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </div>
                <span>Trusted by 5,000+ patients for medical clarity.</span>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5} className="hidden lg:block relative">
            <div className="relative group">
              {/* Glass Mockup Card */}
              <div className="relative z-10 rounded-2xl border border-white/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl p-8 shadow-premium ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Prescription Analysis</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-white/40 shadow-sm transition-transform group-hover:translate-x-2 premium-out">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">Am</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Amoxicillin 500mg</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Antibiotic • Twice Daily</div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 dark:bg-white/5 border border-white/40 shadow-sm transition-transform delay-75 group-hover:translate-x-2 premium-out">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">Pa</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">Paracetamol</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight">Generic Suggestion: Crocin</div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase">AI Verification</span>
                    </div>
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full w-[98%] bg-primary rounded-full" />
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground">Expert clinical match score: 98%</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
            </div>
          </FadeIn>
        </div>

        {/* Existing Feature Strip (Integrated better into Hero) */}
        <FadeIn delay={0.6}>
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left py-12 border-t border-border">
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold text-foreground">AI Vision</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Decipher even the toughest medical handwriting with 98% accuracy.
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold text-foreground">Privacy First</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Your medical data is encrypted and secure. Health-grade privacy standards.
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold text-foreground">Patient Clarity</div>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  Understand your dosage, frequency, and generics in plain simple language.
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
