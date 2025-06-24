import express from "express";
import {
  createShopHandler,
  getShopHandler,
  editShopHandler,
} from "@/controllers/shopController";
import { authenticateUser } from "@/middlewares/auth";

const router = express.Router();

// すべてのルートで認証ミドルウェアを使用
router.use(authenticateUser);

// ショップのルート
router.post("/", createShopHandler);
router.get("/", getShopHandler);
router.put("/", editShopHandler);

export default router;
