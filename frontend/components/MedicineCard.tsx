import { Pill } from "lucide-react";
import type { Medicine } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MedicineCardProps {
  medicine: Medicine;
  className?: string;
}

export function MedicineCard({ medicine, className }: MedicineCardProps) {
  return (
    <Card className={cn("bg-card shadow-cal-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted/30">
                <Pill className="h-4 w-4" />
              </span>
              <span className="truncate">{medicine.name}</span>
            </CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{medicine.dosage}</Badge>
              <Badge variant="subtle">{medicine.frequency}</Badge>
              <Badge variant="subtle">{medicine.duration}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {medicine.instructions ? (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Instructions:</span>{" "}
            {medicine.instructions}
          </div>
        ) : null}
        {medicine.genericAlternatives?.length ? (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Alternatives:</span>{" "}
            {medicine.genericAlternatives.join(", ")}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

