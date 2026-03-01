import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pill, Github, Twitter, Mail } from "lucide-react";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border/50 bg-background pt-16 pb-8", className)}>
      <div className="container-padded">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Pill className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Remedix</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering patients with AI-driven medical clarity. Your personal pharmacist, available 24/7 to help you understand your health journey.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="https://x.com/___SagarPatil/status/2027649939128582198?s=20" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </Link>
              <Link href="https://github.com/adityachavan029/RuntimeRebels" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </Link>
              <Link href="#" className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/upload" className="text-sm text-muted-foreground hover:text-primary transition-colors">Scan Prescription</Link></li>
              <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Personal Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Features</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">HIPAA Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Remedix AI. Built By Runtime Rebels.
          </p>
          <div className="flex gap-8">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              System Status: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

