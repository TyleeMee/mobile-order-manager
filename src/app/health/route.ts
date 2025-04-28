///AWS  ELBヘルスチェック用ファイル

//TODO 単に決めうちで常に200を返すのは良くない。これでは本当のサーバー状態を反映せず、問題が発生している時でもELBがトラフィックを送り続けることになる。
//TODO サーバー状態を反映させた実装に修正する。backend>src>routes>healthRoutes.tsファイルを作成
//TODO import healthRoutes from './routes/healthRoutes'; と　app.use('/health', healthRoutes);をindex.tsに追加

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
