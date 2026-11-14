import Link from "next/link";
import { registerAction } from "@/lib/actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  return (
    <div className="auth">
      <div className="card">
        <h1>Create account</h1>
        <p className="sub">Join the family gift list</p>
        {msg && <p className="msg">{msg}</p>}
        <form action={registerAction} className="form">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" autoComplete="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Create account</button>
        </form>
        <p className="alt">
          Already registered? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
