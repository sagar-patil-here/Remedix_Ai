import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="container-padded pt-16">
      <Card className="glass-card mx-auto max-w-xl">
        <CardHeader className="pb-4">
          <CardTitle>Result not found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            This result ID doesn’t exist in the mock store. Try uploading a file
            to generate a new analysis.
          </div>
          <Button asChild>
            <Link href="/upload">Go to Upload</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

