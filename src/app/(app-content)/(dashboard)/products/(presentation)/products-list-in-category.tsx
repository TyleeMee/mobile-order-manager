import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, PencilIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { Category } from "../../categories/(domain)/category";
import { getSortedProductsInCategory } from "../(application)/products-service";
import { DeleteProductDialog } from "./delete-product-dialog";

type Props = {
  category: Category;
  uid: string;
};

export default function ProductsListInCategory({ category, uid }: Props) {
  // 各カテゴリ用の独立したコンポーネントでSWRを使用
  const {
    data: products,
    error,
    isLoading,
  } = useSWR(
    `products:${uid}:${category.id}`,
    () => getSortedProductsInCategory(uid, category.id),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      keepPreviousData: true,
    }
  );

  if (isLoading) {
    return (
      <div className="pl-4 py-4">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-4 py-4 text-red-500">
        データの読み込みに失敗しました
      </div>
    );
  }

  return (
    <>
      {products &&
        products.map((product, index) => (
          <Draggable key={product.id} draggableId={product.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <Card
                  className={`hover:bg-gray-50 cursor-pointer ${
                    snapshot.isDragging ? "shadow-lg" : ""
                  }`}
                >
                  <CardContent className="p-3 flex items-center justify-between relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center">
                      <div className="h-full flex flex-col justify-center px-1">
                        <GripVertical className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex items-center pl-4">
                      <div className="relative w-10 h-10 mr-4 flex-shrink-0">
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                          style={{
                            width: "40px",
                            height: "40px",
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{product.title}</h3>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <DeleteProductDialog
                        categoryId={category.id}
                        product={product}
                      />
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/products/edit/${product.id}`}>
                          <PencilIcon />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </Draggable>
        ))}
    </>
  );
}
