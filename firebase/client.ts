// import { Analytics, getAnalytics, isSupported } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Webアプリの Firebase 設定
// Firebase JS SDK バージョン 7.20.0 以降では、measurementId は省略可能
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Firebaseの初期化
const currentApps = getApps();
// let auth: Auth;
// let storage: FirebaseStorage;
// let analytics: Analytics | null = null; // 初期値をnullに設定

// Firebase アプリのインスタンスを取得（または新規作成）
const app = currentApps.length ? currentApps[0] : initializeApp(firebaseConfig);

// 共通のサービス初期化
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);

export {
  //  analytics,
  auth,
  storage,
};

//TODO Analyticsでエラーが発生するので、後ほど実装を考える。
// if (!currentApps.length) {
//   const app = initializeApp(firebaseConfig);
//   auth = getAuth(app);
//   storage = getStorage(app);
//   analytics = getAnalytics(app);
// } else {
//   const app = currentApps[0];
//   auth = getAuth(app);
//   storage = getStorage(app);
//   analytics = getAnalytics(app);
// }

// export { analytics, auth, storage };
