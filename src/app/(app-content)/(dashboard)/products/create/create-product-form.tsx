"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { useToast } from "@/hooks/use-toast";

import { createProduct } from "@/services/products-service";
import ProductForm from "../product-form";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

type Props = {
  categoryId: string;
};

export default function CreateProductForm({ categoryId }: Props) {
  const { token } = useAuthToken();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (formdata: FormData) => {
    if (!token) return; // トークンがない場合は早期リターン
    //TODO token === nullの時、createProductが実行されないことになる？
    const response = await createProduct(token, categoryId, formdata);
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
