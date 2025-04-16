import Link from "next/link";

export default function AppContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="bg-primary text-white p-5 h-24 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link
          href="/"
          className="text-2xl tracking-widest flex gap-2 items-center uppercase"
        >
          <span>MOBILE ORDER MANAGER</span>
        </Link>
        <ul className="flex gap-6 items-center">
          <li>
            <Link href="/login" className="tracking-widest hover:underline">
              Login
            </Link>
            <div className="h-8 w-[1px] bg-white/50" />
            <Link href="/register" className="tracking-widest hover:underline">
              Signup
            </Link>
          </li>
        </ul>
      </nav>
      {/* ヘッダーの高さ分のパディングを追加 以下のコンテンツと重ならないようにする*/}
      <div className="pt-24">{children}</div>
    </>
  );
}
