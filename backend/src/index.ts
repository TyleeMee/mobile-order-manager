import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testDbConnection } from "./config/database";
import categoryRoutes from "./routes/categoriesRoutes";
import categorySequenceRoutes from "./routes/categorySequenceRoutes";
import productsRoutes from "./routes/productsRoutes";
import productSequencesRoutes from "./routes/productSequencesRoutes";
import shopRoutes from "./routes/shopRoutes";
import ordersRoutes from "./routes/ordersRoutes";
import { testS3Connection } from "./utils/s3";
import healthRoutes from "./routes/healthRoutes";

// 環境変数の読み込み
dotenv.config();

// Expressアプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 5001;

// ミドルウェアの設定
// app.use(cors());
//TODO 250508に下記に変更、ダメなら上記に戻す。
// CORSの設定 - 全てのオリジンを許可
app.use(
  cors({
    //TODO  本番環境では '*' は避けるべき
    origin:
      process.env.NODE_ENV === "development"
        ? "*" // 開発環境（フロントエンドのURL）
        : "*", // 本番環境

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// S3接続テスト
testS3Connection()
  .then((isConnected) => {
    if (isConnected) {
      console.log("S3接続テスト成功 - アップロード機能は正常に動作します");
    } else {
      console.warn(
        "S3接続テスト失敗 - 画像アップロード機能が動作しない可能性があります"
      );
    }
  })
  .catch((err) => {
    console.error("S3接続テスト中にエラーが発生しました:", err);
    console.warn("画像アップロード機能が動作しない可能性があります");
  });

// データベース接続テスト
testDbConnection()
  .then((isConnected) => {
    if (!isConnected) {
      console.error(
        "データベース接続に失敗しました。アプリケーションを終了します。"
      );
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("データベース接続テスト中にエラーが発生しました:", err);
    process.exit(1);
  });

// ヘルスチェック用のルート（ALBのヘルスチェック用）
app.use("/health", healthRoutes);

// ルートの設定
app.use("/api/categories", categoryRoutes);
app.use("/api/category-sequence", categorySequenceRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/product-sequences", productSequencesRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/orders", ordersRoutes);
// 他のルートをここに追加

// ルートエンドポイント
app.get("/", (req, res) => {
  res.send("Payment Test App API");
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ message: "リクエストされたリソースが見つかりません" });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});

export default app;
