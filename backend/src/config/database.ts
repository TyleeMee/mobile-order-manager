import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
// 環境変数の読み込み
dotenv.config();

// データベース接続設定
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// データベース接続テスト
export const testDbConnection = async (): Promise<boolean> => {
  let client: PoolClient | null = null;
  try {
    //データベース接続
    client = await pool.connect();
    console.log("PostgreSQL database connected successfully");
    return true;
  } catch (err) {
    console.error("Database connection error:", err);
    return false;
  } finally {
    //接続のクローズ
    if (client) client.release();
  }
};
