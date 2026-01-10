import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/server/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  const u = await getUserFromRequest();
  if (!u) return NextResponse.json({ session: null });
  return NextResponse.json({
    session: {
      user: { id: u.id, email: u.email, name: u.name },
      role: u.role,
    },
  });
}