import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FadeIn } from "@/components/motion/fade-in";
import { CalendarCheck, Sparkles, Volume2, MessageCircle, FileText, Pill } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <HeroSection />

      <section id="features" className="py-24 sm:py-32 bg-muted/30 scroll-mt-20">
        <div className="container-padded">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-muted-foreground uppercase tracking-wider">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Everything you need, nothing you don&apos;t</p>
          </div>

          <FadeIn>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI Handwriting Analysis",
                  description: "Convert messy handwriting into clean, structured medicine data using Gemini 2.0.",
                  icon: Sparkles,
                },
                {
                  title: "Generic Alternatives",
                  description: "Save money with AI-suggested generic alternatives and best buying links.",
                  icon: Pill,
                },
                {
                  title: "Smart Reminders",
                  description: "Sync schedules directly to Google Calendar and set customizable alarms.",
                  icon: CalendarCheck,
                },
                {
                  title: "Listen in Your Language",
                  description: "Text-to-speech support for prescriptions in multiple local languages.",
                  icon: Volume2,
                },
                {
                  title: "Telegram Integration",
                  description: "Receive reminders and prescription summaries directly on Telegram.",
                  icon: MessageCircle,
                },
                {
                  title: "PDF Reports",
                  description: "Download comprehensive PDF reports of your analysis for easy sharing.",
                  icon: FileText,
                }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-cal-sm transition-all hover:shadow-cal-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold leading-7 text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="container-padded">
          <FadeIn>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How it works</h2>
              <p className="mt-4 text-lg text-muted-foreground">Three simple steps to unlock clarity from illegibility.</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 rounded-2xl border bg-card p-8 sm:grid-cols-3 sm:p-12 shadow-cal-sm">
              <div className="flex flex-col text-center items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background font-bold text-lg">1</div>
                <div className="mt-6 text-lg font-semibold text-foreground">Upload</div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Drag & drop your prescription image or PDF securely.
                </div>
              </div>
              <div className="flex flex-col text-center items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background font-bold text-lg">2</div>
                <div className="mt-6 text-lg font-semibold text-foreground">Analyze</div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Our AI extracts medicines, dosage, and maps generic options.
                </div>
              </div>
              <div className="flex flex-col text-center items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background font-bold text-lg">3</div>
                <div className="mt-6 text-lg font-semibold text-foreground">Act</div>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Compare prices, sync to calendar, or listen to the audio readout.
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-16 flex justify-center">
              <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-cal-md">
                <Link href="/upload">Start Your Analysis</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
