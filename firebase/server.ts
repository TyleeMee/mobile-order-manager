import {
  cert,
  getApps,
  initializeApp,
  ServiceAccount,
} from "firebase-admin/app";
import { Auth, getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

// デバッグログ用の関数（any型を避ける）
const logInfo = (message: string): void =>
  console.log(`[Firebase Admin] ${message}`);
const logError = (message: string, error: unknown): void =>
  console.error(`[Firebase Admin Error] ${message}`, error);

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: "googleapis.com",
};

let firestore: Firestore;
let storage: Storage;
let auth: Auth;
const currentApps = getApps();

try {
  if (!currentApps.length) {
    logInfo("Firebase Admin SDKの初期化を開始します");
    logInfo(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    logInfo(`Client Email: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    logInfo(`Private Key available: ${!!process.env.FIREBASE_PRIVATE_KEY}`);

    const app = initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    firestore = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);

    logInfo("Firebase Admin SDKの初期化が成功しました");

    // 簡易的なFirestore接続テスト
    (async () => {
      try {
        logInfo("Firestoreの接続テストを実行します");

        // 空のドキュメントを読み取ろうとする（存在しなくてもエラーにならない）
        const testDoc = await firestore
          .collection("_connection_test")
          .doc("test")
          .get();
        logInfo(
          `Firestore接続テスト結果: ${
            testDoc.exists
              ? "既存ドキュメント検出"
              : "ドキュメント未検出（正常）"
          }`
        );
      } catch (testError) {
        logError("Firestore接続テストが失敗しました", testError);
      }
    })();
  } else {
    logInfo("既存のFirebase Admin SDKを使用します");
    const app = currentApps[0];
    firestore = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  }
} catch (initError) {
  logError("Firebase Admin SDKの初期化中にエラーが発生しました", initError);
  // 重大なエラーなので再スロー
  throw initError;
}

export { auth, firestore, storage };
