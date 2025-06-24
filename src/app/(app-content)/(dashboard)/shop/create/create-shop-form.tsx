"use client";
import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import ShopForm from "../shop-form";
import { createShop } from "@/services/shop-service";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

export default function CreateShopForm() {
  const { token } = useAuthToken();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    if (!token) return; // トークンがない場合は早期リターン
    //TODO token === nullの時、createShopが実行されないことになる？
    try {
      const result = await createShop(token, formData);

      if (result.error) {
        toast({
          title: "保存に失敗しました",
          description: result.message || "エラーが発生しました",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "店舗情報を保存しました",
        variant: "success",
      });
      router.push("/shop");
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      toast({
        title: "保存に失敗しました",
        description: "ネットワークエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <ShopForm
        handleSubmitAction={handleSubmit}
        submitButtonLabel={
          <>
            <PlusCircleIcon />
            保存する
          </>
        }
      />
    </div>
  );
}
