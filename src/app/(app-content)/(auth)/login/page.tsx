// page.tsx に追加
export const dynamic = "force-static";

import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import LoginForm from "./login-form";

export default function Login() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter>
          アカウントをお持ちでない方
          <Link href="/register" className="underline pl-2">
            新規作成する
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
