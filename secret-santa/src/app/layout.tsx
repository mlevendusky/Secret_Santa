import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";
import "./globals.css";

export const metadata: Metadata = { title: "Secret Santa" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              <span className="brand-mark">🎁</span>
              Secret Santa
            </Link>
            {session?.user ? (
              <nav className="nav">
                <Link href="/my-list">My list</Link>
                <Link href="/people">People</Link>
                <div className="user-pill">
                  <span>{session.user.name}</span>
                  <form action={logoutAction}>
                    <button type="submit" className="btn btn-ghost btn-sm">Log out</button>
                  </form>
                </div>
              </nav>
            ) : (
              <nav className="nav">
                <Link href="/login">Log in</Link>
                <Link href="/register">Register</Link>
              </nav>
            )}
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
