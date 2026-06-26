import { NextResponse } from "next/server";
import { resetStoreForTests } from "@/lib/store";

export async function POST() {
  if (process.env.FORKS_STORE !== "memory") {
    return NextResponse.json({ error: "Test reset is only available for memory store runs." }, { status: 404 });
  }

  resetStoreForTests();
  return NextResponse.json({ ok: true });
}
