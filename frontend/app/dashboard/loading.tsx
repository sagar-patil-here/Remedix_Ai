import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-padded pt-10">
      <div className="flex items-end justify-between">
        <div>
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-3 h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-5">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle>Prescription summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-7">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle>Medicine comparison table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

