import express from "express";
import {
  getCategorySequenceHandler,
  updateCategorySequenceHandler,
} from "../controllers/categorySequenceController";
import { authenticateUser } from "../middlewares/auth";

const router = express.Router();

// すべてのルートで認証ミドルウェアを使用
router.use(authenticateUser);

//TODO パスを修正する
// カテゴリー順序の操作
router.get("/", getCategorySequenceHandler);
router.put("/", updateCategorySequenceHandler);

export default router;
