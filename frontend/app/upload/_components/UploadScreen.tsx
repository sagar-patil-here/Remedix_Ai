"use client";

import { useAuth } from "@clerk/nextjs";

import * as React from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  UploadCloud,
  AlertTriangle,
  FileX2,
  X,
  Cpu,
} from "lucide-react";
import { uploadPrescription } from "@/lib/api/client";
import type { PrescriptionResult, PrescriptionLanguage } from "@/lib/types";
import { Languages } from "lucide-react";
import { PrescriptionEditor } from "@/components/PrescriptionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
const MAX_SIZE = 12 * 1024 * 1024;

function validateFile(file: File | null): string | null {
  if (!file || file.size === 0) return "Please select a file.";
  if (!ACCEPTED_TYPES.includes(file.type)) return "Upload PNG, JPG, WEBP, or PDF.";
  if (file.size > MAX_SIZE) return "Max file size is 12 MB.";
  return null;
}

export function UploadScreen() {
  const { userId } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewKind, setPreviewKind] = React.useState<"image" | "pdf" | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showUnreadableAlert, setShowUnreadableAlert] = React.useState(false);
  const [result, setResult] = React.useState<PrescriptionResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = React.useState<PrescriptionLanguage>("en");
  const [pipeline, setPipeline] = React.useState<"gemini" | "ml_pipeline">("gemini");
  const [rawView, setRawView] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);

  const pickFile = React.useCallback(
    (next: File) => {
      setFile(next);
      setError(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (next.type === "application/pdf") {
        setPreviewKind("pdf");
        setPreviewUrl(null);
      } else {
        setPreviewKind("image");
        setPreviewUrl(URL.createObjectURL(next));
      }
    },
    [previewUrl],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) pickFile(dropped);
  };

  const onAnalyze = async () => {
    const validationError = validateFile(file);
    if (validationError || !file) {
      setError(validationError ?? "Please select a file.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const parsed = await uploadPrescription(file, selectedLanguage, pipeline, userId);

      const isEmpty = parsed.medicines.length === 0 && !parsed.doctorName && !parsed.patientName && !parsed.diagnosis;
      if (isEmpty) {
        throw new Error("Backend is unable to get text from the image. The image is not clear, please upload a new image.");
      }

      setResult(parsed);
      setRawView(false);
      setIsVerified(false);
    } catch (err) {
      let message = err instanceof Error ? err.message : "Analysis failed. Please try again.";

      // Check if it's our specific unreadable error from the backend
      if (message.toLowerCase().includes("not clear") || message.toLowerCase().includes("unable to get text")) {
        setShowUnreadableAlert(true);
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onReset = () => {
    setResult(null);
    setError(null);
    setFile(null);
    setRawView(false);
    setIsVerified(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewKind(null);
  };

  const onDownloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prescription-${result.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <Card className="overflow-hidden border-border/80 shadow-cal-sm">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 p-8 text-white">
            <div className="space-y-4">
              <Badge className="bg-white/15 text-white hover:bg-white/20">AI Prescription Intake</Badge>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight">
                Upload once, get structured data you can edit and download.
              </h2>
              <p className="max-w-xl text-sm text-blue-100/90">
                Files are sent to your existing backend upload endpoint, then rendered in an editable
                prescription document format.
              </p>
            </div>
          </div>

          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.25fr,1fr]">
            <div className="flex flex-col gap-6">
              <div className="space-y-1">
                <CardTitle className="text-xl">Upload Prescription</CardTitle>
                <CardDescription>
                  Drag and drop or browse an image/PDF. Max size 12 MB.
                </CardDescription>
              </div>

              <div
                onDrop={onDrop}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={cn(
                  "rounded-xl border-2 border-dashed p-6 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/15",
                )}
              >
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
                      <UploadCloud className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Drop file here</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, PDF</p>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Browse File
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(event) => {
                    const selected = event.target.files?.[0];
                    if (selected) pickFile(selected);
                  }}
                />

                <div className="mt-5 rounded-lg border border-border/60 bg-background p-4">
                  {!file ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      No file selected yet.
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Language Selection */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Languages className="h-4 w-4" />
                    <span>Instructions Language</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "en", label: "English", flag: "🇬🇧" },
                      { id: "hi", label: "हिन्दी", flag: "🇮🇳" },
                      { id: "mr", label: "मराठी", flag: "🇮🇳" },
                    ].map((lang) => (
                      <Button
                        key={lang.id}
                        type="button"
                        variant={selectedLanguage === lang.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLanguage(lang.id as PrescriptionLanguage)}
                        className={cn(
                          "h-9 px-4 transition-all duration-200",
                          selectedLanguage === lang.id
                            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                            : "hover:bg-muted"
                        )}
                      >
                        <span className="mr-2 text-base">{lang.flag}</span>
                        {lang.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 italic">
                    * Patient-friendly instructions will be generated in your selected language.
                  </p>
                </div>

                {/* Pipeline Selection */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Cpu className="h-4 w-4" />
                    <span>AI Pipeline</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant={pipeline === "gemini" ? "default" : "outline"}
                      className={cn(
                        "flex-1 justify-start h-12 transition-all duration-200",
                        pipeline === "gemini"
                          ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setPipeline("gemini")}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-sm">Direct Gemini</span>
                        <span className="text-[10px] opacity-80 font-normal">Fast, single-step processing</span>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant={pipeline === "ml_pipeline" ? "default" : "outline"}
                      className={cn(
                        "flex-1 justify-start h-12 transition-all duration-200 outline-purple-500",
                        pipeline === "ml_pipeline"
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md ring-2 ring-purple-600/30 border-purple-600"
                          : "hover:bg-muted"
                      )}
                      onClick={() => setPipeline("ml_pipeline")}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-sm">ML Pipeline (Beta)</span>
                        <span className="text-[10px] opacity-80 font-normal">Qwen OCR + Gemini structure</span>
                      </div>
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button className="sm:flex-1" disabled={isSubmitting || !file} onClick={onAnalyze}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Scan Prescription
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={onReset} disabled={isSubmitting}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/10 p-4">
              <p className="mb-3 text-sm font-medium">File Preview</p>
              {!previewKind ? (
                <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-border bg-background">
                  <p className="text-sm text-muted-foreground">Preview will appear here</p>
                </div>
              ) : previewKind === "pdf" ? (
                <div className="flex h-[500px] items-center justify-center rounded-lg border border-border bg-background">
                  <div className="text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">PDF selected</p>
                    <p className="text-xs text-muted-foreground">Preview disabled for PDF files</p>
                  </div>
                </div>
              ) : (
                <div className="relative h-[500px] overflow-hidden rounded-lg border border-border bg-background">
                  {previewUrl && (
                    <Image
                      src={previewUrl}
                      alt="Selected prescription"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {result && (
        <FadeIn delay={0.05}>
          {/* Success Verification Alert */}
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-700">Scan Successful!</p>
                  <p className="text-xs text-emerald-600/90 leading-relaxed">
                    Your prescription has been analyzed. Please double-check all extracted medication names, dosages, and instructions against the original physical document provided by your doctor before saving.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="verify-prescription"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-emerald-500/40 text-emerald-600 focus:ring-emerald-500/30"
                  />
                  <label
                    htmlFor="verify-prescription"
                    className="text-xs font-medium text-emerald-700 cursor-pointer select-none hover:text-emerald-800"
                  >
                    I have verified the analyzed prescription with the doctor's original document.
                  </label>
                </div>
              </div>
            </div>
          </div>

          <Card className="border-border/80 shadow-cal-sm">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Structured Prescription File</CardTitle>
                <CardDescription>
                  Edit extracted fields and download as PDF from the document editor.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {result.isUnreadable && (
                <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border-2 border-red-500/20 bg-red-500/5 p-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <FileX2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-red-700">Completely Unreadable</h3>
                    <p className="max-w-md text-sm text-red-600/80 leading-relaxed">
                      This prescription appears to be too messy or blurred for our AI to extract reliable medical data.
                      Please upload a clearer image or enter the details manually below.
                    </p>
                  </div>
                </div>
              )}

              {result.isLowConfidence && !result.isUnreadable && (
                <div className="mb-6 flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-amber-700">Messy Handwriting Detected</p>
                    <p className="text-xs text-amber-600/90 leading-relaxed">
                      The extraction confidence is lower than usual. We've highlighted uncertain fields in the editor.
                      Please double-check all medication names and dosages before saving.
                    </p>
                  </div>
                </div>
              )}

              {rawView ? (
                <pre className="max-h-[700px] overflow-auto rounded-lg border border-border bg-muted/15 p-4 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              ) : (
                <PrescriptionEditor
                  result={result}
                  onSave={(updated) => setResult(updated)}
                  isVerified={isVerified}
                />
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Custom Unreadable Alert Modal */}
      {showUnreadableAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 pointer-events-none">
          <FadeIn className="relative w-full max-w-lg pointer-events-auto">
            <div className="overflow-hidden rounded-2xl border bg-background shadow-2xl ring-1 ring-black/5">
              <div className="flex flex-col items-center gap-4 bg-red-500/5 p-8 text-center sm:p-10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-inner">
                  <FileX2 className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Unreadable Image</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    The AI was unable to extract any text from the provided image. This usually happens if the handwriting is completely illegible, the image is too blurry, or it's not a medical prescription.
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setShowUnreadableAlert(false);
                    onReset();
                    fileInputRef.current?.click();
                  }}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Clearer Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowUnreadableAlert(false)}
                >
                  Dismiss
                </Button>
              </div>

              <button
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => setShowUnreadableAlert(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
