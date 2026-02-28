import { AlarmClock } from "lucide-react";
import type { Reminder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface ReminderCardProps {
  reminders: Reminder[];
}

export function ReminderCard({ reminders }: ReminderCardProps) {
  return (
    <Card className="bg-card shadow-cal-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-muted/30">
            <AlarmClock className="h-4 w-4" />
          </span>
          Reminders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reminders.length ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No reminders yet. Add a schedule from the result page.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-background/50">
            {reminders.map((r, idx) => (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {r.schedule}
                    </div>
                  </div>
                  <div className="text-sm font-medium tabular-nums">
                    {r.time}
                  </div>
                </div>
                {idx !== reminders.length - 1 ? (
                  <Separator className="mt-4" />
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

