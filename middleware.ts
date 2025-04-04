//!delete this file later(if i don't need this for release version)
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// import { auth } from "./firebase/server";

// export async function middleware(request: NextRequest) {
//   console.log("MIDDLEWARE:", request.url);
//   if (request.method === "POST") {
//     return NextResponse.next();
//   }

//   const cookieStore = await cookies();
//   const session = cookieStore.get("session")?.value;

//   if (!session) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   try {
//     // セッション Cookie を検証
//     const decodedClaims = await auth.verifySessionCookie(session, true);
//     const uid = decodedClaims.uid;

//     // リクエストヘッダーにuidを追加（サーバーコンポーネントで使用するため）
//     const requestHeaders = new Headers(request.headers);
//     requestHeaders.set("x-uid", uid);

//     return NextResponse.next({
//       request: {
//         headers: requestHeaders,
//       },
//     });
//   } catch (error) {
//     // セッションが無効な場合はログインページにリダイレクト
//     console.error("セッション無効", error);
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
// }

// export const config = {
//   matcher: ["/:path*"],
// };
