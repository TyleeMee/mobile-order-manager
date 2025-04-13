import { NextRequest, NextResponse } from "next/server";

import { getNewOrders } from "@/app/(dashboard)/orders/(application)/orders-service";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "UID is required" }, { status: 400 });
  }

  try {
    const orders = await getNewOrders(uid);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("新規オーダーの取得に失敗しました:", error);
    return NextResponse.json(
      { error: "新規オーダーの取得に失敗しました" },
      { status: 500 }
    );
  }
}
