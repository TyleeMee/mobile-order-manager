"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { useToast } from "@/hooks/use-toast";

import { createProduct } from "@/services/products-service";
import ProductForm from "../product-form";

type Props = {
  categoryId: string;
};

export default function CreateProductForm({ categoryId }: Props) {
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formdata: FormData) => {
    const response = await createProduct(categoryId, formdata);
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
