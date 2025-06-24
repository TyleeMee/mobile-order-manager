import React from "react";

import CategoriesList from "./categories-list";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mt-6">商品カテゴリー</h1>
      <CategoriesList />
    </div>
  );
}
