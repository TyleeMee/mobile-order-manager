import { Request, Response } from "express";
import {
  createNewOrder,
  getOrders,
  getNewOrders,
  getPastOrders,
  getOrderById,
  changeOrderStatus,
} from "../services/ordersService";
import { OrderData } from "../models/Order";

/**
 * 注文を作成する
 */
export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orderData: Partial<OrderData> = {
      ownerId: req.body.ownerId,
      userId: req.body.userId || userId,
      pickupId: req.body.pickupId,
      items: req.body.items,
      productIds: req.body.productIds,
      orderStatus: req.body.orderStatus,
      orderDate: req.body.orderDate ? new Date(req.body.orderDate) : new Date(),
      total: req.body.total,
    };

    const result = await createNewOrder(orderData);

    if ("error" in result) {
      return res.status(400).json({
        message: result.message,
        error: true,
      });
    }

    return res.status(201).json({ id: result.id });
  } catch (error) {
    console.error("注文作成エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

/**
 * 全注文を取得する
 */
export const getAllOrdersHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orders = await getOrders(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("注文取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

/**
 * 新規注文を取得する
 */
export const getNewOrdersHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orders = await getNewOrders(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("新規注文取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

/**
 * 過去注文を取得する
 */
export const getPastOrdersHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orders = await getPastOrders(userId);
    return res.status(200).json(orders);
  } catch (error) {
    console.error("過去注文取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

/**
 * 注文IDで取得する
 */
export const getOrderByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ message: "注文IDが指定されていません" });
    }

    const order = await getOrderById(userId, orderId);
    if (!order) {
      return res.status(404).json({ message: "注文が見つかりません" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("注文取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

/**
 * 注文ステータスを更新する
 */
export const updateOrderStatusHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const orderId = req.params.orderId;
    if (!orderId) {
      return res.status(400).json({ message: "注文IDが指定されていません" });
    }

    const newStatus = req.body.orderStatus;
    if (!newStatus) {
      return res
        .status(400)
        .json({ message: "新しい注文ステータスが指定されていません" });
    }

    const result = await changeOrderStatus(userId, orderId, newStatus);

    if ("error" in result) {
      return res.status(400).json({
        message: result.message,
        error: true,
      });
    }

    return res.status(200).json({ message: "注文ステータスが更新されました" });
  } catch (error) {
    console.error("注文ステータス更新エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};
