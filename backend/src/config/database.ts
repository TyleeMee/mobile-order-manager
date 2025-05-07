import { Pool, PoolClient } from "pg";
import dotenv from "dotenv";
import { fromIni } from "@aws-sdk/credential-providers";
import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";

// 環境変数の読み込み
dotenv.config();

const sslConfig =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: true } // 本番環境: 証明書検証あり
    : { rejectUnauthorized: false }; // 開発環境: 証明書検証なし(sshでEC2に接続するとエラーが起きるため)

// データベース接続設定（基本設定）
const dbConfig = {
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslConfig,
};

// 既存のプール - 環境変数のホストを使用
export const pool = new Pool({
  host: process.env.DB_HOST,
  ...dbConfig,
});

// 動的プール生成関数
export const getPool = async (): Promise<Pool> => {
  // 開発環境ではAWS SDKを使わず直接接続
  if (process.env.NODE_ENV !== "production") {
    console.log("開発環境: 直接DB_HOSTを使用します");
    return pool;
  }
  // AWS SDKを使用しない場合は既存のプールを返す
  if (process.env.NODE_ENV === "production") {
    console.log("本番環境: 直接DB_HOSTを使用します");
    return pool;
  }

  // AWS SDKを使用する場合はRDSエンドポイントを取得
  try {
    const rdsClient = new RDSClient({
      region: process.env.REGION || "ap-northeast-1",
      credentials: fromIni({ profile: "myprofile" }),
    });

    const command = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: process.env.DB_INSTANCE_ID,
    });

    const response = await rdsClient.send(command);
    const endpoint = response.DBInstances?.[0]?.Endpoint?.Address;

    if (!endpoint) {
      console.warn(
        "RDSエンドポイントが見つかりません。環境変数のDBホストを使用します。"
      );
      return pool;
    }

    console.log(`RDSエンドポイントを取得しました: ${endpoint}`);
    return new Pool({
      host: endpoint,
      ...dbConfig,
    });
  } catch (error) {
    console.error("RDSエンドポイントの取得に失敗しました:", error);
    console.warn("環境変数のDBホストを使用します。");
    return pool;
  }
};

// データベース接続テスト
export const testDbConnection = async (): Promise<boolean> => {
  let client: PoolClient | null = null;
  try {
    console.log("接続設定:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      // パスワードはセキュリティのため表示しない
    });

    const dynamicPool = await getPool();
    console.log("プール取得成功、接続を試みます...");
    client = await dynamicPool.connect();
    console.log("PostgreSQL データベース接続成功");
    return true;
  } catch (err) {
    console.error("データベース接続エラー:", err);
    return false;
  } finally {
    if (client) client.release();
  }
};
