"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

import ProductForm from "@/app/(dashboard)/products/(presentation)/product-form";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useToast } from "@/hooks/use-toast";
import { productSchema } from "@/validation/product-schema";

import { editProduct, getProduct } from "../../(application)/products-service";
import { Product } from "../../(domain)/product";

type Props = {
  productId: string;
};

export default function EditProductForm({ productId }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const user = useAuthenticatedUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffectを使用してデータを取得
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await getProduct(user.uid, productId);
        setProduct(productData);
      } catch (error) {
        console.error("商品データの取得に失敗しました:", error);
        toast({
          title: "エラー",
          description: "商品データの取得に失敗しました",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, user, toast]);

  const handleSubmit = async (data: z.infer<typeof productSchema>) => {
    try {
      const response = await editProduct(user.uid, productId, data);
      if (!!response.error) {
        toast({
          title: "エラー",
          description: response.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "商品を修正しました",
        variant: "success",
      });

      router.push("/products");

      console.log({ response });
    } catch (error) {
      console.error("商品の更新に失敗しました:", error);
      toast({
        title: "エラー",
        description: "商品の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return <div>商品データが見つかりません</div>;
  }

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
        defaultValues={{
          title: product.title,
          imageUrl: product.imageUrl,
          imagePath: product.imagePath,
          description: product.description,
          price: product.price,
          isVisible: product.isVisible,
          isOrderAccepting: product.isOrderAccepting,
        }}
      />
    </div>
  );
}
