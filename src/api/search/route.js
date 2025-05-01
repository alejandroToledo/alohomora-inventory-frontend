// src/app/api/search/route.js
import { NextResponse } from "next/server";
import searchInventory from "../../functions/searchInventory";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { error: "Missing query param 'q'" },
      { status: 400 }
    );
  }
  try {
    const result = await searchInventory(q);
    return NextResponse.json(result);
  } catch (err) {
    console.error("API search error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
