"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  LayoutDashboard,
  Menu,
  X,
  Home,
  Sparkles,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";

export interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Removed unused navLinks

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const authLinks = (
    <>
      <SignedIn>
        <Link
          href="/upload"
          onClick={closeMenu}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium">Scan Prescription</span>
        </Link>
        <Link
          href="/dashboard"
          onClick={closeMenu}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-medium">Dashboard</span>
        </Link>
      </SignedIn>
      <SignedOut>
        <Link
          href="/upload"
          onClick={closeMenu}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          <LogIn className="h-5 w-5 text-primary" />
          <span className="font-medium">Get Started</span>
        </Link>
      </SignedOut>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container-padded flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/30">
            <Activity className="h-4 w-4" />
          </span>
          <span className="text-base md:text-lg font-semibold tracking-tight">
            Remedix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <SignedIn>
            <Button asChild variant="secondary" className="inline-flex">
              <Link href="/upload">Scan Prescription</Link>
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

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-2 z-50">
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            onClick={toggleMenu}
            className="p-2 text-foreground/70 hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 sm:hidden"
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 top-0 h-fit bg-background border-b border-border z-50 sm:hidden shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col p-6 pt-16 relative">
                <button
                  onClick={closeMenu}
                  className="absolute top-4 right-4 p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 px-4">
                    Navigation
                  </p>
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    <Home className="h-5 w-5 text-primary" />
                    <span className="font-medium">Home</span>
                  </Link>
                  <div className="h-px bg-border/50 my-4" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 px-4">
                    Account
                  </p>
                  <div className="flex flex-col gap-1 text-foreground">
                    {authLinks}
                  </div>
                </div>

                <div className="mt-8 pb-4">
                  <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                    <p className="text-xs font-semibold text-primary mb-1 italic">Remedix AI</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Helping you understand your health, one prescription at a time.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
