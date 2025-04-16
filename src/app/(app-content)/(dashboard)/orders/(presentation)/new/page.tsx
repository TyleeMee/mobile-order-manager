"use client";

import OrdersTable from "../orders-table";

export default function NewOrdersPage() {
  return (
    <OrdersTable
      title="新規オーダーリスト"
      // fetchOrdersAction={fetchNewOrders}
      apiEndpoint="/api/orders/new" // fetchOrdersActionの代わりにAPIエンドポイントを渡す
      loadingErrorMessage="新規オーダーの読み込みに失敗しました"
      emptyMessage="新規オーダーはありません"
      isNewOrderTable={true}
    />
  );
}
