// src/app/api/search/route.js
import { NextResponse } from "next/server";
import searchInventory from "../../../functions/searchInventory";

export async function GET(request) {
  console.log("[/api/search] ▶ Received request URL:", request.url);
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  console.log("[/api/search] query param 'q':", q);
  
  if (!q) {
    console.warn("[/api/search] Missing query param 'q'");
    return NextResponse.json(
      { error: "Missing query param 'q'" },
      { status: 400 }
    );
  }

  try {
    console.log("[/api/search] Calling searchInventory…");
    const result = await searchInventory(q);
    console.log("[/api/search] searchInventory result counts:", {
      exact: Array.isArray(result.exact) ? result.exact.length : 0,
      alternatives: Array.isArray(result.alternatives) ? result.alternatives.length : 0
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/search] ERROR:", err.stack || err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
