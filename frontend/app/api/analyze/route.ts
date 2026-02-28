import { NextResponse } from "next/server";
import { createMockAnalysis } from "@/lib/mock/prescriptions";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  const fileName =
    file && typeof file === "object" && "name" in file
      ? String((file as File).name)
      : "prescription";

  const result = createMockAnalysis({ fileName });
  return NextResponse.json(result);
}

