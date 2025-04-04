import React from "react";

import CategoriesList from "./(presentation)/categories-list";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mt-6">商品カテゴリー</h1>
      <CategoriesList />
    </div>
  );
}
