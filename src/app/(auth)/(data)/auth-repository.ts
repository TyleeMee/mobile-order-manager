"use server";

import { auth, firestore } from "../../../../firebase/server";

type CreateUserParams = {
  displayName: string;
  email: string;
  password: string;
};

//Firebase Authenticationにユーザーを追加
export const addFirebaseUser = async (
  userData: CreateUserParams
): Promise<string> => {
  const userRecord = await auth.createUser({
    displayName: userData.displayName,
    email: userData.email,
    password: userData.password,
  });

  return userRecord.uid; // UID を返す
};

//ownerコレクションに追加（商品データ等を格納するため）
export const addOwner = async (uid: string) => {
  // Firestore の参照
  const userRef = firestore.collection("owners").doc(uid);
  const userSnap = await userRef.get();

  // 初回登録の場合のみユーザーデータをFirestoreに保存
  if (!userSnap.exists) {
    console.log("Firestore に新しいユーザーを登録");
    await userRef.set({
      createdAt: new Date(),
    });
  } else {
    console.error("Firestore に既存のユーザーがいます");
  }
  try {
  } catch (error) {
    console.error("createOwnerでエラー", error);
  }
};
