"use client";
import { UserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useAuth } from "@/contexts/auth-context-firebase";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function AuthButtons() {
  const auth = useAuth();
  return (
    <div>
      {!!auth?.currentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <UserRound></UserRound>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>
              <div>{auth.currentUser.displayName}</div>
              <div className="font-normal text-xs">
                {auth.currentUser.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await auth.logout();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!auth?.currentUser && (
        <div className="flex gap-2 items-center">
          <Link href="/register" className="tracking-widest hover:underline">
            新規登録
          </Link>
          <div className="h-8 w-[1px] bg-white/50" />
          <Link href="/login" className="tracking-widest hover:underline">
            ログイン
          </Link>
        </div>
      )}
    </div>
  );
}
