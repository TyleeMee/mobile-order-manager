"use client";

import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user-firebase";
import { useToast } from "@/hooks/use-toast";
import { categorySchema } from "@/validation/category-schema";

import CategoryDialog from "../category-dialog";
import { createCategory } from "@/services/categories-service";

export default function CreateCategoryDialog() {
  const { toast } = useToast();

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    const response = await createCategory(data);

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
