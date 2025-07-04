"use client";

import { History, Store, Users, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ナビゲーションアイテムの型定義
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

// ナビゲーションアイテムのデータ
const navItems: NavItem[] = [
  {
    title: "メニュー",
    href: "/products",
    icon: Utensils,
  },
  {
    title: "店舗",
    href: "/shop",
    icon: Store,
  },
  {
    title: "新規オーダー",
    href: "/orders/new",
    icon: Users,
  },
  {
    title: "注文履歴",
    href: "/orders/past",
    icon: History,
  },
];

// モバイル用ボトムナビゲーションコンポーネント
const MobileNav: React.FC = () => {
  const pathname = usePathname();

  // モバイル用に表示するナビゲーションアイテムを制限（上位5つまで）
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// サイドバーコンポーネント
const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // ヘッダーの高さに合わせてトップマージンを追加（ヘッダーの高さが96px = 24px * 4）
  return (
    <div className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-24 border-r">
      <ScrollArea className="flex-1">
        <div className="space-y-2 px-4 py-2 pt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center w-full p-2 rounded-md",
                pathname === item.href
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.title}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

// メインレイアウトコンポーネントの型定義
interface DashboardLayoutProps {
  children: React.ReactNode;
}

// メインレイアウトコンポーネント
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* サイドバー（デスクトップのみ） */}
      <Sidebar />

      {/* モバイルヘッダー */}

      {/* モバイルボトムナビゲーション */}
      <MobileNav />

      {/* メインコンテンツ */}
      <main className="lg:pl-64 pt-24 pb-16 lg:pb-0">{children}</main>
    </div>
  );
};

export default DashboardLayout;
