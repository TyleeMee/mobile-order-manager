"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { z } from "zod";

import ShopForm from "@/app/(app-content)/(dashboard)/shop/(presentation)/shop-form";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { shopSchema } from "@/validation/shop-schema";

import { createShop } from "../../(application)/shop-service";

export default function CreateShopForm() {
  const { toast } = useToast();
  const router = useRouter();
  const user = useAuthenticatedUser();

  const handleSubmit = async (data: z.infer<typeof shopSchema>) => {
    const uid = user.uid;

    const response = await createShop(uid, data);
    if (!!response.error) {
      toast({
        title: "保存に失敗しました",
        description: response.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "店舗情報を保存しました",
      // description: "商品を追加しました",
      variant: "success",
    });

    router.push("/products");

    console.log({ response });
  };

  return (
    <div>
      <ShopForm
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
