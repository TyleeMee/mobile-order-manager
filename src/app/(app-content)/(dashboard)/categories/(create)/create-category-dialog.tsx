"use client";

import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { categorySchema } from "@/validation/category-schema";

import CategoryDialog from "../category-dialog";
import { createCategory } from "@/services/categories-service";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

export default function CreateCategoryDialog() {
  const { token } = useAuthToken();
  const { toast } = useToast();

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    if (!token) return; // トークンがない場合は早期リターン
    //TODO token === nullの時、createCategoryが実行されないことになる？
    //TODO loadingStateやtrycathcは設けなくて良いの？（deleteCategoryDialog参照）
    const response = await createCategory(token, data);

    if (!!response.error) {
      toast({
        title: "エラー",
        description: response.message,
        variant: "destructive",
      });
      return;
    }

    // router.pushではなく、完全にページをリロード
    //? streamでcategoriesDataを取得しないと自動で更新されない
    window.location.href = "/products";

    console.log({ response });
  };
  return (
    <div>
      <CategoryDialog
        handleSubmitAction={handleSubmit}
        triggerButton={
          <Button className="inline-flex gap-2 mt-4">
            <PlusCircleIcon /> 商品カテゴリーを追加
          </Button>
        }
      />
    </div>
  );
}
