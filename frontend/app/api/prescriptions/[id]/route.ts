import { NextResponse } from "next/server";
import { getPrescription } from "@/lib/mock/prescriptions";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const result = getPrescription(params.id);
  if (!result) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}

