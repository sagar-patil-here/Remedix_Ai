import { FadeIn } from "@/components/motion/fade-in";
import { UploadScreen } from "@/app/upload/_components/UploadScreen";

export default function UploadPage() {
  return (
    <div className="container-padded pt-10">
      <FadeIn>
        <div className="max-w-5xl">
          <h2 className="text-2xl font-semibold tracking-tight">Upload</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Analyze a prescription into structured medicines and patient-friendly guidance.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.06}>
        <div className="mt-8">
          <UploadScreen />
        </div>
      </FadeIn>
    </div>
  );
}

