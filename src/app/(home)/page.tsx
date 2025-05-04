import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getImagesFromS3Folder } from "@/lib/s3-utils";

// 静的ページ生成のためのデータフェッチ
//TODO 画像取得・表示ロジックを完成させる　できればSSRで
async function getHomeImage() {
  // 'home/' はS3バケット内のフォルダパス
  const imageData = await getImagesFromS3Folder("home/");
  return imageData.length > 0 ? imageData[0] : null;
}

//* App Routerはサーバーコンポーネントなので、コンポーネント関数内で直接asyncとawaitを使用できる
export default async function Home() {
  const homeImage = await getHomeImage();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-96px)] px-4 py-8">
      <div className="max-w-screen-lg w-full">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
          <div className="flex flex-col justify-between w-full md:w-1/2 aspect-square bg-white p-6 rounded-lg">
            <div className="flex flex-col h-full justify-between">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                テイクアウト用
                <br />
                モバイルオーダー
              </h1>

              <p className="text-lg text-gray-700 mb-8 md:mb-16">
                <strong>Webやスマホから簡単にお持ち帰りの注文を受け付け</strong>
              </p>

              <div>
                <Button
                  asChild
                  className="w-full py-6 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  <Link href="/register">無料で始める</Link>
                </Button>

                <p className="text-xs text-gray-500 mt-4">
                  ※注文ごとに販売手数料が発生します。
                </p>
              </div>
            </div>
          </div>
          {/* 画像表示（画像がない場合は白い背景のみ） */}
          <div className="w-full md:w-1/2 aspect-square bg-white rounded-lg overflow-hidden relative">
            {homeImage && homeImage.url && (
              <Image
                src={homeImage.url}
                alt={homeImage.name || "ヒーロー画像"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}
            {/* 画像がない場合は何も表示しない（divの背景色が表示される） */}
          </div>
        </div>
      </div>
    </div>
  );
}
