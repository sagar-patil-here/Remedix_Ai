import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FadeIn } from "@/components/motion/fade-in";
import {
  CalendarCheck,
  Sparkles,
  Volume2,
  MessageCircle,
  FileText,
  Pill,
  Zap,
  Shield,
  Search,
  ArrowRight,
  TrendingDown,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />

      {/* Trust / Social Proof Strip */}
      <section className="border-y border-primary/30 bg-primary/5 py-8">
        <div className="container-padded">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-bold tracking-tight">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-bold tracking-tight">Instant Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              <span className="text-sm font-bold tracking-tight">99% Accuracy</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-bold tracking-tight">Privacy First</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section Redesign */}
      <section id="features" className="py-24 sm:py-32 scroll-mt-20">
        <div className="container-padded">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center mb-20">
              <h2 className="text-base font-semibold leading-7 text-primary uppercase tracking-widest">Platform</h2>
              <p className="mt-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                Everything You Need to Understand Your Prescription
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Handwriting Analysis",
                description: "Convert even the messiest medical handwriting into clean, structured digital data.",
                icon: Sparkles,
                color: "bg-blue-500/10 text-blue-600"
              },
              {
                title: "Generic Alternatives",
                description: "Save up to 70% on medication costs with AI-suggested generic alternatives.",
                icon: TrendingDown,
                color: "bg-emerald-500/10 text-emerald-600"
              },
              {
                title: "Smart Reminders",
                description: "Sync schedules directly to Google Calendar and receive Telegram alerts.",
                icon: Clock,
                color: "bg-amber-500/10 text-amber-600"
              },
              {
                title: "Multi-Language Audio",
                description: "Listen to your prescription instructions in your preferred local language.",
                icon: Volume2,
                color: "bg-purple-500/10 text-purple-600"
              },
              {
                title: "Buying Guides",
                description: "Direct links to trusted pharmacy partners for the best prices online.",
                icon: Pill,
                color: "bg-rose-500/10 text-rose-600"
              },
              {
                title: "Secure PDF Reports",
                description: "Download and share clean PDF summaries with family or other doctors.",
                icon: FileText,
                color: "bg-cyan-500/10 text-cyan-600"
              }
            ].map((feature, index) => (
              <FadeIn key={index} delay={index * 0.05}>
                <div className="group relative flex flex-col gap-6 rounded-2xl border border-border/50 bg-card p-8 shadow-premium transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/20">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section (Visual Only) */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container-padded">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center mb-20">
              <h2 className="text-base font-semibold text-primary uppercase tracking-widest">Process</h2>
              <p className="mt-4 text-3xl font-bold text-foreground">Clarity in 3 Simple Steps</p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {[
                { step: "01", title: "Upload Prescription", desc: "Securely upload an image or PDF of your handwritten prescription." },
                { step: "02", title: "AI Analysis", desc: "Our medical-grade AI extracts names, dosages, and instructions." },
                { step: "03", title: "Get Clarity", desc: "Review your structured medicine schedule and find savings." }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex flex-col items-center text-center group">
                    <div className="h-16 w-16 rounded-full bg-background border-2 border-primary flex items-center justify-center text-primary font-bold text-xl mb-6 shadow-soft group-hover:scale-110 transition-transform">
                      {item.step}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground max-w-[250px]">{item.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="container-padded">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-tight">
                  Your Health Data, <br />
                  <span className="text-primary italic">Organized & Accessible.</span>
                </h2>
                <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
                  Say goodbye to deciphering medical scribbles. Remedix creates a structured health dashboard for you, tracking every medicine, its purpose, and when you need it.
                </p>
                <div className="mt-10 space-y-4">
                  {[
                    "Find generic alternatives instantly",
                    "Voice readouts in local languages",
                    "One-click Google Calendar sync"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-12">
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/dashboard">Explore Your Dashboard</Link>
                  </Button>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-muted rounded-xl p-6 aspect-video flex items-center justify-center">
                    {/* Simplified Dashboard Visual */}
                    <div className="w-full space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="h-6 w-32 bg-foreground/10 rounded" />
                        <div className="h-6 w-24 bg-primary/20 rounded" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted-foreground/5 rounded-lg border border-border" />)}
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-foreground/5 rounded" />
                        <div className="h-4 w-3/4 bg-foreground/5 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-xl -rotate-3 hidden sm:block">
                  <div className="text-3xl font-bold mb-1">98%</div>
                  <div className="text-xs uppercase tracking-widest opacity-80">Accuracy Score</div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="container-padded">
          <FadeIn>
            <div className="relative rounded-[2.5rem] bg-foreground p-12 sm:p-20 overflow-hidden text-center text-background">
              {/* Background accent */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[50%] h-[100%] rounded-full bg-primary/20 blur-[100px]" />

              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                  Take Control of Your Prescriptions Today
                </h2>
                <p className="text-lg opacity-80 mb-12 leading-relaxed">
                  Join thousands of patients who use Remedix to bring clarity and convenience to their healthcare journey.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all border-none">
                    <Link href="/upload">Analyze Prescription</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-14 px-10 rounded-full bg-transparent text-background border-2 border-background/20 hover:bg-white/10 transition-all">
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Utility component used in dashboard preview
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
