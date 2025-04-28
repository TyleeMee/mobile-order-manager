import express from "express";
import {
  createProductHandler,
  getProductsInCategoryHandler,
  getProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "../controllers/productsController";
import { authenticateUser } from "../middlewares/auth";

const router = express.Router();

// すべてのルートで認証ミドルウェアを使用
router.use(authenticateUser);

// 商品のCRUD操作
router.post("/category/:categoryId", createProductHandler);
router.get("/category/:categoryId", getProductsInCategoryHandler);
router.get("/:id", getProductHandler);
router.put("/:id", updateProductHandler);
router.delete("/:id", deleteProductHandler);

export default router;
