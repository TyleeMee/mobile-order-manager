import { pool } from "./database";

/**
 * データベースのテーブルを初期化する関数
 */
export const initializeTables = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    // トランザクション開始
    await client.query("BEGIN");

    // カテゴリーテーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        owner_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // カテゴリー順序テーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS category_sequence (
        id SERIAL PRIMARY KEY,
        owner_id VARCHAR(255) PRIMARY KEY,
        category_ids TEXT[] NOT NULL DEFAULT '{}'
      )
    `);

    // 商品テーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id VARCHAR(255) NOT NULL,
        category_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(2048) NOT NULL,
        image_path VARCHAR(1024) NOT NULL,
        description VARCHAR(1000),
        price INTEGER NOT NULL,
        is_visible BOOLEAN NOT NULL DEFAULT false,
        is_order_accepting BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // 商品順序テーブル作成
    await client.query(`
  CREATE TABLE IF NOT EXISTS product_sequences (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) NOT NULL,
    category_id VARCHAR(255) NOT NULL,
    product_ids TEXT[] NOT NULL DEFAULT '{}',
    UNIQUE(owner_id, category_id)
  )
`);
    // ショップテーブル作成
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        image_url VARCHAR(2048) NOT NULL,
        image_path VARCHAR(1024) NOT NULL,
        description VARCHAR(1000),
        prefecture VARCHAR(10) NOT NULL,
        city VARCHAR(100) NOT NULL,
        street_address VARCHAR(200) NOT NULL,
        building VARCHAR(200),
        is_visible BOOLEAN NOT NULL DEFAULT false,
        is_order_accepting BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // トランザクションコミット
    await client.query("COMMIT");
    console.log("Database tables initialized successfully");
  } catch (err) {
    // エラー発生時はロールバック
    await client.query("ROLLBACK");
    console.error("Failed to initialize database tables:", err);
    throw err;
  } finally {
    client.release();
  }
};
