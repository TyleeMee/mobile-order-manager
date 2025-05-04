import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegisterForm from "./register-form";

export default function Register() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">新規作成</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter>
        すでにアカウントをお持ちの方
        <Link href="/login" className="pl-2 underline">
          ログインする
        </Link>
      </CardFooter>
    </Card>
  );
}
