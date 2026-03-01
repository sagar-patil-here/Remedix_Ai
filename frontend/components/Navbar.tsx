import Link from "next/link";
import { Activity, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";

export interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container-padded flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30">
            <Activity className="h-4 w-4" />
          </span>
          <span className="text-base md:text-lg font-semibold tracking-tight">
            Remedix
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignedIn>
            <Button asChild variant="secondary" className="hidden sm:inline-flex">
              <Link href="/upload">Analyze Prescription</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard" className="gap-2 inline-flex items-center">
                Dashboard
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button asChild>
              <Link href="/upload" className="gap-2 inline-flex items-center">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
