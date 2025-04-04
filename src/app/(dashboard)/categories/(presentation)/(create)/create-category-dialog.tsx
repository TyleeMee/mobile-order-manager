"use client";

import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { categorySchema } from "@/validation/category-schema";

import { createCategory } from "../../(application)/categories-service";
import CategoryDialog from "../category-dialog";

export default function CreateCategoryDialog() {
  const { toast } = useToast();
  const user = useAuthenticatedUser();

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    const uid = user.uid;

    const response = await createCategory(uid, data);

    if (!!response.error) {
      toast({
        title: "エラー",
        description: response.message,
        variant: "destructive",
      });
      return;
    }

    // toast({
    //   title: "商品カテゴリーを追加しました",
    //   // description: "商品を追加しました",
    //   variant: "success",
    // });

    // router.pushではなく、完全にページをリロード
    window.location.href = "/products";

    console.log({ response });
  };
  return (
    <div>
      <CategoryDialog
        handleSubmit={handleSubmit}
        triggerButton={
          <Button className="inline-flex gap-2 mt-4">
            <PlusCircleIcon /> 商品カテゴリーを追加
          </Button>
        }
      />
    </div>
  );
}
