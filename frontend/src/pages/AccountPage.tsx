import React, { useState } from "react";
import { AuthUser, Loan } from "../types";
import { Button } from "../components/ui/Button";

type AccountPageProps = {
  user: AuthUser | null;
  token: string | null;
  loans: Loan[];
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
  onRefreshLoans: () => Promise<void>;
};

export function AccountPage({ user, token, loans, onLogin, onRegister, onLogout, onRefreshLoans }: AccountPageProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"login" | "register">("login");
  const [subtab, setSubtab] = useState<"loans" | "holds" | "noti" | "settings">("loans");
  const [loading, setLoading] = useState(false);

  if (!user) {
    const submitLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setErr("");
      if (!email || !pass) { setErr("請輸入 Email 與密碼"); return; }
      try {
        setLoading(true);
        await onLogin(email.trim(), pass);
      } catch (ex) {
        console.error(ex);
        setErr("登入失敗：請確認帳號密碼，或後端服務是否正常。");
      } finally { setLoading(false); }
    };

    const submitRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setErr("");
      if (!/.+@.+\..+/.test(email)) { setErr("Email 格式不正確"); return; }
      if ((pass || "").length < 6) { setErr("密碼至少 6 碼"); return; }
      try {
        setLoading(true);
        await onRegister(email.trim(), pass);
      } catch (ex) {
        console.error(ex);
        setErr((ex instanceof Error ? ex.message : "") || "註冊失敗，請稍後再試或聯絡管理員。");
      } finally { setLoading(false); }
    };

    const clearForm = () => { setEmail(""); setPass(""); setErr(""); };

    return (
      <main className="mx-auto max-w-sm px-4 py-10">
        <h1 className="text-2xl font-bold">我的帳戶</h1>
        <div className="mt-4 flex items-center gap-2">
          <Button variant={tab === "login" ? "primary" : "secondary"} size="sm" onClick={() => { setTab("login"); setErr(""); }}>登入</Button>
          <Button variant={tab === "register" ? "primary" : "secondary"} size="sm" onClick={() => { setTab("register"); setErr(""); }}>註冊</Button>
        </div>

        {tab === "login" && (
          <form onSubmit={submitLogin} className="mt-4 grid gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <input className="border rounded-xl px-3 h-11" placeholder="Email（例：user@hul）" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border rounded-xl px-3 h-11" placeholder="密碼" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? "登入中…" : "登入"}</Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={clearForm}>清除</Button>
            </div>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={submitRegister} className="mt-4 grid gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <input className="border rounded-xl px-3 h-11" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="border rounded-xl px-3 h-11" placeholder="密碼（至少 6 碼）" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>{loading ? "送出中…" : "建立帳號"}</Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={clearForm}>清除</Button>
            </div>
          </form>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">已登入：<span className="font-medium">{user.email}</span>（一般會員）</div>
        <Button variant="secondary" size="sm" onClick={onLogout}>登出</Button>
      </div>
      <div className="mt-3 flex gap-2">
        {[{ k: "loans", t: "借閱中" }, { k: "holds", t: "預約" }, { k: "noti", t: "通知" }, { k: "settings", t: "設定" }].map(({ k, t }) => (
          <Button key={k} variant={subtab === k ? "primary" : "secondary"} size="sm" onClick={() => setSubtab(k as any)}>{t}</Button>
        ))}
      </div>
      <div className="mt-4 border border-gray-200 bg-white rounded-2xl p-6 min-h-[200px]">
        {subtab === "loans" && (
          <div className="text-sm text-gray-700 space-y-3">
            <button className="inline-flex items-center px-3 py-1.5 rounded-xl border border-gray-300 text-xs hover:bg-gray-50" onClick={onRefreshLoans}>重新整理</button>
            {(!loans || loans.length === 0) && <div>目前沒有借閱中的書籍。</div>}
            {loans && loans.length > 0 && (
              <div className="space-y-2">
                {loans.map((loan) => (
                  <div key={loan.id} className="border border-gray-200 rounded-2xl p-3 flex flex-col gap-1 bg-gray-50">
                    <div className="font-semibold">{loan.book_title || loan.title || "無書名"}</div>
                    <div className="text-xs text-gray-600">ISBN：{loan.book_isbn || loan.isbn || "—"}</div>
                    <div className="text-xs text-gray-600">借閱日期：{loan.loan_date || loan.start_date || "—"}</div>
                    <div className="text-xs text-gray-600">到期日：{loan.due_date || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {subtab === "holds" && <div className="text-sm text-gray-700">你的預約會顯示在此。</div>}
        {subtab === "noti" && <div className="text-sm text-gray-700">通知中心尚無新訊息。</div>}
        {subtab === "settings" && (
          <form className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-600 mb-1">通知方式</label>
              <select className="border border-gray-300 rounded-2xl px-3 py-2"><option>Email</option><option>LINE</option></select>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">介面語言</label>
              <select className="border border-gray-300 rounded-2xl px-3 py-2"><option>繁體中文</option><option>English</option></select>
            </div>
            <Button>儲存設定</Button>
          </form>
        )}
      </div>
    </main>
  );
}
