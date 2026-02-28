import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { FadeIn } from "@/components/motion/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CalendarCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <HeroSection />

      <section className="pb-16 sm:pb-24">
        <div className="container-padded">
          <FadeIn>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI handwriting interpretation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Convert messy handwriting into clean, structured medicine data.
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Medicine price comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Compare across vendors with future real pricing + substitutes.
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4" />
                    Smart reminders & exports
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Calendar-ready schedules and PDF export for easy sharing.
                </CardContent>
              </Card>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="mt-12 grid gap-6 rounded-2xl border border-border bg-muted/20 p-8 sm:grid-cols-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Step 01
                </div>
                <div className="mt-2 text-sm font-medium">Upload</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Drag & drop your prescription (image or PDF).
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Step 02
                </div>
                <div className="mt-2 text-sm font-medium">Interpret</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Get a structured summary with dosage, duration, and notes.
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">
                  Step 03
                </div>
                <div className="mt-2 text-sm font-medium">Act</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Compare prices, export PDF, and add reminders.
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="mt-10 flex justify-center">
              <Button asChild size="lg">
                <Link href="/upload">Upload Prescription</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}

