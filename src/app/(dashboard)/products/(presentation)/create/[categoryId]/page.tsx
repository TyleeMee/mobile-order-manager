import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import CreateProductForm from "../create-product-form";

export default async function CreateProduct({
  params,
}: {
  params: { categoryId: string };
}) {
  const { categoryId } = await params;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">商品登録</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProductForm categoryId={categoryId} />
        </CardContent>
      </Card>
    </div>
  );
}
