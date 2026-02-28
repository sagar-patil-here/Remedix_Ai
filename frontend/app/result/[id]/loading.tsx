import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-padded pt-10">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="mt-3 h-4 w-80" />
        </div>
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="aspect-[3/4] w-full" />
            </CardContent>
          </Card>
          <Card className="shadow-cal-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <Card className="shadow-cal-sm bg-card">
            <CardHeader className="pb-4">
              <CardTitle>Structured interpretation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-3/6" />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

