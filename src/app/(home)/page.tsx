// import Image from "next/image";

import { EyeIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-96px)] px-4">
      <div className="max-w-screen-lg w-full">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
          {/* 左側の正方形 - 情報とボタン */}
          <div className="flex flex-col justify-between w-full md:w-1/2 aspect-square bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col h-full justify-between">
              {/* 1. 大きめの文字でタイトル */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center md:text-left mb-4 leading-tight">
                テイクアウト用
                <br />
                モバイルオーダー
              </h1>

              {/* 2. 小さめの文字で説明 */}
              <p className="text-lg text-gray-700 mb-8 md:mb-16">
                <strong>Webやスマホから簡単にお持ち帰りの注文を受け付け</strong>
              </p>

              {/* 3. ボタン */}
              <div>
                <button className="w-full py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300">
                  無料で始める
                </button>

                {/* 4. 注釈 */}
                <p className="text-xs text-gray-500 mt-4">
                  ※注文ごとに販売手数料が発生します。
                </p>
              </div>
            </div>
          </div>

          {/* 右側の正方形 - 画像表示 */}
          <div className="w-full md:w-1/2 aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <EyeIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
