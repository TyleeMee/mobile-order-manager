import { NextRequest, NextResponse } from "next/server";

import { getPastOrders } from "@/app/(dashboard)/orders/(application)/orders-service";

export async function GET(request: NextRequest) {
  // クエリパラメータからuidを取得
  const url = new URL(request.url);
  const uid = url.searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "UIDが必要です" }, { status: 400 });
  }

  try {
    const orders = await getPastOrders(uid);
    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json(
      { error: "注文履歴の取得に失敗しました:${e}", e },
      { status: 500 }
    );
  }
}
