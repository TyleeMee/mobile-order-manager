import express from "express";
import {
  createOrderHandler,
  getAllOrdersHandler,
  getNewOrdersHandler,
  getPastOrdersHandler,
  getOrderByIdHandler,
  updateOrderStatusHandler,
} from "../controllers/ordersController";
import { authenticateUser } from "../middlewares/auth";

const router = express.Router();

// すべてのルートで認証ミドルウェアを使用
router.use(authenticateUser);

// 注文の作成
router.post("/", createOrderHandler);

// 全注文の取得
router.get("/", getAllOrdersHandler);

// 新規注文の取得
router.get("/new", getNewOrdersHandler);

// 過去注文の取得
router.get("/past", getPastOrdersHandler);

// 注文IDによる取得
router.get("/:orderId", getOrderByIdHandler);

// 注文ステータスの更新
router.put("/:orderId/status", updateOrderStatusHandler);

export default router;
