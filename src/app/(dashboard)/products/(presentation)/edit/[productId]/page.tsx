import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EditProductForm from "../edit-product-form";

export default async function EditProduct({
  params,
}: {
  params: { productId: string };
}) {
  const { productId } = await params;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">商品編集</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProductForm productId={productId} />
        </CardContent>
      </Card>
    </div>
  );
}
