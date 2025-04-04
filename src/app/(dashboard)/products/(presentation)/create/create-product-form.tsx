"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { z } from "zod";

import ProductForm from "@/app/(dashboard)/products/(presentation)/product-form";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { productSchema } from "@/validation/product-schema";

import { createProduct } from "../../(application)/products-service";

type Props = {
  categoryId: string;
};

export default function CreateProductForm({ categoryId }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const user = useAuthenticatedUser();

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    const uid = user.uid;

    const response = await createProduct(uid, categoryId, data);
    if (!!response.error) {
      toast({
        title: "保存に失敗しました",
        description: response.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "商品を保存しました",
      // description: "商品を追加しました",
      variant: "success",
    });

    router.push("/products");

    console.log({ response });
  };

  return (
    <div>
      <ProductForm
        handleSubmit={handleSubmit}
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
