"use client";

import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user-firebase";
import { useToast } from "@/hooks/use-toast";

import { Shop } from "@/models/shop";
import { getShop } from "@/services/shop-service";
import EditShopForm from "./edit/edit-shop-form";
import CreateShopForm from "./create/create-shop-form";

// 店舗データの状態を表す型
type ShopState = {
  status: "loading" | "loaded" | "error" | "not-exists";
  data: Shop | null;
  error?: string;
};

export default function ShopPage() {
  const { toast } = useToast();
  const [shopState, setShopState] = useState<ShopState>({
    status: "loading",
    data: null,
  });

  // useEffectを使用してデータを取得
  useEffect(() => {
    const loadShop = async () => {
      try {
        const shopData = await getShop();

        if (shopData) {
          // データが存在する場合
          setShopState({
            status: "loaded",
            data: shopData,
          });
        } else {
          // データが存在しない場合（新規作成必要）
          setShopState({
            status: "not-exists",
            data: null,
          });
        }
      } catch (error) {
        console.error("店舗情報の取得に失敗しました:", error);
        setShopState({
          status: "error",
          data: null,
          error: "店舗情報の取得に失敗しました",
        });

        toast({
          title: "エラー",
          description: "店舗情報の取得に失敗しました",
          variant: "destructive",
        });
      }
    };

    loadShop();
  }, [toast]);

  // ローディング中の表示
  if (shopState.status === "loading") {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-96px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // エラー時の表示
  if (shopState.status === "error") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>
          {shopState.error ||
            "店舗情報の取得に失敗しました。再度お試しください。"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold"></CardTitle>
        </CardHeader>
        <CardContent>
          {shopState.status === "loaded" ? (
            <EditShopForm shop={shopState.data!} />
          ) : (
            <CreateShopForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
