"use client";
import { UserRound } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useAuth } from "@/context/auth-context";

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
            {/* <DropdownMenuItem asChild>
              <Link href="/account">My Account</Link>
            </DropdownMenuItem> */}
            {/* {!!auth.customClaims?.admin && (
              <DropdownMenuItem asChild>
                <Link href="/admin-dashboard">Admin Dashboard</Link>
              </DropdownMenuItem>
            )}
            {!auth.customClaims?.admin && (
              <DropdownMenuItem asChild>
                <Link href="/account/my-favorites">My Favorites</Link>
              </DropdownMenuItem>
            )} */}
            <DropdownMenuItem
              onClick={async () => {
                await auth.logout();
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        // <>
        //   <div>{auth.currentUser.email}</div>
        //   <div
        //     onClick={() => {
        //       auth.logout();
        //     }}
        //   >
        //     Logout
        //   </div>
        // </>
      )}
      {!auth?.currentUser && (
        <div className="flex gap-2 items-center">
          <Link href="/login" className="tracking-widest hover:underline">
            Login
          </Link>
          <div className="h-8 w-[1px] bg-white/50" />
          <Link href="/register" className="tracking-widest hover:underline">
            Signup
          </Link>
        </div>
      )}
    </div>
  );
}
