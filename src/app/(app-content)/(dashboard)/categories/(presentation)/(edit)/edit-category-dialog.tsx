"use client";

import { PencilIcon } from "lucide-react";
import React from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { categorySchema } from "@/validation/category-schema";

import { editCategory } from "../../(application)/categories-service";
import { Category } from "../../(domain)/category";
import CategoryDialog from "../category-dialog";

type Props = {
  category: Category;
};

export default function EditCategoryDialog({ category }: Props) {
  const { toast } = useToast();
  const user = useAuthenticatedUser();

  const handleSubmit = async (data: z.infer<typeof categorySchema>) => {
    const uid = user.uid;

    const response = await editCategory(uid, category.id, data);

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
