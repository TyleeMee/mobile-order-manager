"use client";

import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { OrderWithProductTitles } from "@/models/order";
import ClickableTableRow from "./clickable-table-row";
import NewOrderDialog from "./new/new-order-dialog";
import PastOrderDialog from "./past/past-order-dialog";
import { useAuthToken } from "@/auth/hooks/use-auth-token";

type OrdersTableProps = {
  title: string;
  fetchOrdersAction: (
    token: string | null
  ) => Promise<OrderWithProductTitles[]>;
  loadingErrorMessage: string;
  emptyMessage: string;
  isNewOrderTable?: boolean;
};

export default function OrdersTablePage({
  title,
  fetchOrdersAction,
  loadingErrorMessage,
  emptyMessage,
  isNewOrderTable = false,
}: OrdersTableProps) {
  const { token } = useAuthToken();
  const [orders, setOrders] = useState<OrderWithProductTitles[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] =
    useState<OrderWithProductTitles | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  //* 関数のメモ化
  //* 依存配列の値が変わらない限り、再レンダリング間で同じ関数参照を保持。以下の循環を防ぐ
  //* コンポーネントのレンダリング → 新しい loadOrders 関数の作成 → useEffect の実行 → 状態更新 → 再レンダリング
  const loadOrders = useCallback(async () => {
    setLoading(true);
    // トークンがない場合は何もしない
    if (!token) {
      console.log("トークンがまだ準備できていないため、データ取得を待機します");
      return;
    }
    try {
      const fetchedOrders = await fetchOrdersAction(token);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      console.error(`${loadingErrorMessage}:`, err);
      setError(loadingErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, loadingErrorMessage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // 注文ステータス変更後のリロード
  const handleStatusChange = () => {
    loadOrders();
    setDialogOpen(false);
  };

  // Server Action として宣言 (名前にActionをつける)
  const handleRowClickAction = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setDialogOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-96px)]">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px] hidden md:table-cell">
                    注文ステータス
                  </TableHead>
                  <TableHead className="w-[120px]">受け渡しID</TableHead>
                  <TableHead>アイテム</TableHead>
                  <TableHead className="w-[80px] text-right hidden xl:table-cell">
                    日時
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <ClickableTableRow
                    key={order.id}
                    order={order}
                    onClickAction={handleRowClickAction}
                  />
                ))}
              </TableBody>
            </Table>

            {/* 選択された注文のダイアログ */}
            {selectedOrder &&
              (isNewOrderTable ? (
                <NewOrderDialog
                  order={selectedOrder}
                  onStatusChange={handleStatusChange}
                  triggerElement={<span style={{ display: "none" }} />}
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                />
              ) : (
                <PastOrderDialog
                  order={selectedOrder}
                  triggerElement={<span style={{ display: "none" }} />}
                  open={dialogOpen}
                  onOpenChange={setDialogOpen}
                />
              ))}
          </>
        }
      </CardContent>
    </Card>
  );
}
