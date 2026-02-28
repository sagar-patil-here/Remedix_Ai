"use client";

import * as React from "react";
import { FileDown, Languages, Plus, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PrescriptionLanguage } from "@/lib/types";

export interface ExportSectionProps {
  onTranslate?: (lang: PrescriptionLanguage) => void;
  onAddReminder?: () => void;
  onViewDashboard?: () => void;
}

export function ExportSection({
  onTranslate,
  onAddReminder,
  onViewDashboard,
}: ExportSectionProps) {
  const [lang, setLang] = React.useState<PrescriptionLanguage>("en");

  return (
    <Card className="bg-card shadow-cal-sm">
      <CardHeader className="pb-4">
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button
          variant="outline"
          className="justify-start gap-2"
          onClick={() => window.print()}
        >
          <FileDown className="h-4 w-4" />
          Export as PDF
        </Button>

        <div className="grid gap-2 rounded-xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Languages className="h-4 w-4" />
            Translate
          </div>
          <Select
            value={lang}
            onValueChange={(v) => {
              const next = v as PrescriptionLanguage;
              setLang(next);
              onTranslate?.(next);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="mr">Marathi</SelectItem>
              <SelectItem value="ta">Tamil</SelectItem>
              <SelectItem value="te">Telugu</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-xs text-muted-foreground">
            Placeholder: real translation will use backend/LLM later.
          </div>
        </div>

        <Button
          variant="secondary"
          className="justify-start gap-2"
          onClick={onAddReminder}
        >
          <Plus className="h-4 w-4" />
          Add reminder
        </Button>

        <Button
          className="justify-start gap-2"
          onClick={onViewDashboard}
        >
          <LayoutGrid className="h-4 w-4" />
          View detailed dashboard
        </Button>
      </CardContent>
    </Card>
  );
}

