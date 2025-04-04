//!delete this file later(i probably don't need this for release version)

"use server";

import { cookies } from "next/headers";

import { auth } from "../../firebase/server";

export const removeToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("firebaseAuthToken");
  cookieStore.delete("firebaseAuthRefreshToken");
};

export const setToken = async ({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) => {
  try {
    //攻撃者が偽のトークンを送る可能性があり、正しく署名されたものかどうかをチェック
    const verifiedToken = await auth.verifyIdToken(token);
    if (!verifiedToken) {
      return;
    }

    const expiresIn = 60 * 60 * 24 * 9 * 1000; // セッション有効期限（9日）
    const sessionCookie = await auth.createSessionCookie(token, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      httpOnly: true,
      //(secure)set true if in production environment.
      //referring to if it's required to have Https or not.
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000, // expiresInはミリ秒なので秒単位の9日間に変換
      path: "/",
    });

    cookieStore.set("firebaseAuthToken", token, {
      httpOnly: true,
      //(secure)set true if in production environment.
      //referring to if it's required to have Https or not.
      secure: process.env.NODE_ENV === "production",
    });
    cookieStore.set("firebaseAuthRefreshToken", refreshToken, {
      httpOnly: true,
      //(secure)set true if in production environment.
      //referring to if it's required to have Https or not.
      secure: process.env.NODE_ENV === "production",
    });
  } catch (e) {
    console.log(e);
  }
};
