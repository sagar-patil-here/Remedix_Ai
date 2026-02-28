import Link from "next/link";
import { ExternalLink, ShoppingBag } from "lucide-react";
import type { PriceLink } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PriceComparisonProps {
  links: PriceLink[];
}

export function PriceComparison({ links }: PriceComparisonProps) {
  return (
    <Card className="bg-card shadow-cal-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted/30">
            <ShoppingBag className="h-4 w-4" />
          </span>
          Price comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {links.map((l) => (
          <div
            key={l.vendor}
            className="rounded-xl border border-border bg-background/50 p-4 transition-colors hover:bg-muted/30"
          >
            <div className="text-sm font-medium">{l.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {l.price ? `From ${l.price}` : l.note ?? "—"}
            </div>
            <Button asChild variant="secondary" className="mt-3 w-full">
              <Link href={l.href} className="inline-flex items-center gap-2">
                Open
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

