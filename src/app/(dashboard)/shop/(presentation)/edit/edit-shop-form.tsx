"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { z } from "zod";

import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { shopSchema } from "@/validation/shop-schema";

import { editShop } from "../../(application)/shop-service";
import { Shop } from "../../(domain)/shop";
import ShopForm from "../shop-form";

type Props = {
  shop: Shop;
};

export default function EditShopForm({ shop }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const user = useAuthenticatedUser();

  const handleSubmit = async (data: z.infer<typeof shopSchema>) => {
    try {
      const response = await editShop(user.uid, data);
      if (!!response.error) {
        toast({
          title: "エラー",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "店舗情報を修正しました",
        variant: "success",
      });

      router.push("/products");

      console.log({ response });
    } catch (error) {
      console.error("店舗情報の更新に失敗しました:", error);
      toast({
        title: "エラー",
        description: "店舗情報の更新に失敗しました",
        variant: "destructive",
      });
    }
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
        defaultValues={{
          title: shop.title,
          imageUrl: shop.imageUrl,
          imagePath: shop.imagePath,
          description: shop.description,
          prefecture: shop.prefecture,
          city: shop.city,
          streetAddress: shop.streetAddress,
          building: shop.building,
          isVisible: shop.isVisible,
          isOrderAccepting: shop.isOrderAccepting,
        }}
      />
    </div>
  );
}
