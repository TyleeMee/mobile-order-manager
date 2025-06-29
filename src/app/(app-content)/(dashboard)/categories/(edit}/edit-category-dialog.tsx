"use client";

import { PencilIcon } from "lucide-react";
import React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { categorySchema } from "@/validation/category-schema";

import { Category } from "@/models/category";
import CategoryDialog from "../category-dialog";
import { editCategory } from "@/services/categories-service";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

type Props = {
  category: Category;
};

export default function EditCategoryDialog({ category }: Props) {
  const { token } = useAuthToken();
  const { toast } = useToast();

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    if (!token) return; // トークンがない場合は早期リターン
    //TODO token === nullの時、editCategoryが実行されないことになる？
    const response = await editCategory(token, category.id, data);

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
    window.location.href = "/categories";

    console.log({ response });
  };

  return (
    <div>
      <CategoryDialog
        handleSubmitAction={handleSubmit}
        triggerButton={
          <Button variant="outline" size="sm">
            <PencilIcon />
          </Button>
        }
        defaultValues={{ title: category.title }}
      />
    </div>
  );
}
