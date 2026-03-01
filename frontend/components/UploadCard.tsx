"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { uploadPrescription } from "@/lib/api/client";
import type { PrescriptionResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE = 12 * 1024 * 1024;

function validateFile(file: File | null): string | null {
  if (!file || file.size === 0) return "Please select a file.";
  if (!ACCEPTED_TYPES.includes(file.type)) return "Upload an image or PDF.";
  if (file.size > MAX_SIZE) return "Max file size is 12 MB.";
  return null;
}

export interface UploadCardProps {
  className?: string;
  onAnalyzed?: (result: PrescriptionResult) => void;
}

export function UploadCard({ className, onAnalyzed }: UploadCardProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewKind, setPreviewKind] = React.useState<"image" | "pdf" | null>(null);

  const pickFile = React.useCallback(
    (f: File) => {
      setFile(f);
      setError(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (f.type === "application/pdf") {
        setPreviewKind("pdf");
        setPreviewUrl(null);
      } else {
        setPreviewKind("image");
        setPreviewUrl(URL.createObjectURL(f));
      }
    },
    [previewUrl]
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  };

  const callApi = async (fileToSend: File) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await uploadPrescription(fileToSend);
      onAnalyzed?.(result);
      if (!onAnalyzed) router.push(`/result/${result.id}`);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnalyze = () => {
    const validationError = validateFile(file);
    if (validationError || !file) {
      setError(validationError ?? "Please select a file.");
      return;
    }
    callApi(file);
  };

  const handleSampleData = () => {
    const dummyFile = new File(["sample"], "sample-prescription.jpg", {
      type: "image/jpeg",
    });
    callApi(dummyFile);
  };

  return (
    <Card className={cn("shadow-cal-sm border-border bg-card", className)}>
      <CardHeader>
        <CardTitle>Upload prescription</CardTitle>
        <CardDescription>
          Drag & drop an image/PDF or browse files. We&apos;ll return a clean,
          structured interpretation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative rounded-xl border border-border bg-background/50 p-6 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/30">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Drop file here</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  PNG, JPG, WEBP, or PDF (max 12MB)
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*,application/pdf"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickFile(f);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse
              </Button>
              {file && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {file.name}
                </span>
              )}
            </div>

            {error && (
              <div className="mt-3 text-sm text-destructive font-medium">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background/50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Preview</div>
              <div className="text-xs text-muted-foreground">
                {previewKind ? previewKind.toUpperCase() : "\u2014"}
              </div>
            </div>

            <div className="mt-4">
              {!previewKind ? (
                <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
                  <div className="text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      No file selected yet
                    </div>
                  </div>
                </div>
              ) : previewKind === "pdf" ? (
                <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">PDF selected</div>
                      <div className="text-sm text-muted-foreground">
                        Preview will be available after analysis.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-muted/20">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Uploaded preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Skeleton className="h-full w-full" />
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <Button
                type="button"
                className="w-full"
                disabled={isSubmitting || !file}
                onClick={handleAnalyze}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing&hellip;
                  </>
                ) : (
                  "Analyze Prescription"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                onClick={handleSampleData}
              >
                Try with sample data
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Demo mode &mdash; backend integration in progress.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
