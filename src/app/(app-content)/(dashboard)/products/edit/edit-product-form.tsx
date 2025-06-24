"use client";

import { PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";

import { editProduct, getProduct } from "@/services/products-service";
import { Product } from "@/models/product";
import ProductForm from "../product-form";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

type Props = {
  productId: string;
};

export default function EditProductForm({ productId }: Props) {
  const { token } = useAuthToken();
  const { toast } = useToast();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffectを使用してデータを取得
  useEffect(() => {
    const loadProduct = async () => {
      // トークンがない場合は何もしない
      if (!token) {
        console.log(
          "トークンがまだ準備できていないため、データ取得を待機します"
        );
        return;
      }
      try {
        const productData = await getProduct(token, productId);
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
  }, [token, productId, toast]);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await editProduct(token, productId, formData);
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
        handleSubmitAction={handleSubmit}
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
          description: product.description || "",
          price: product.price,
          isVisible: product.isVisible,
          isOrderAccepting: product.isOrderAccepting,
        }}
      />
    </div>
  );
}
