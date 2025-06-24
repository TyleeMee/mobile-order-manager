import express from "express";
import {
  getProductSequenceHandler,
  updateProductSequenceHandler,
} from "../controllers/productSequencesController";
import { authenticateUser } from "../middlewares/auth";

const router = express.Router();

// すべてのルートで認証ミドルウェアを使用
router.use(authenticateUser);

// 商品順序の操作
router.get("/category/:categoryId", getProductSequenceHandler);
router.put("/", updateProductSequenceHandler);

export default router;
