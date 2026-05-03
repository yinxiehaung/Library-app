import React, { useState, useEffect } from "react";
import { loginUser, registerUser } from "./api/auth";
import { getMyLoans } from "./api/loans";
import { AuthUser, Loan } from "./types";
import { USER_KEY, TOKEN_KEY, VIEWS_KEY, SEED_BOOKS } from "./constants";
import { readUsers, writeUsers } from "./utils/helpers";
import { Navbar } from "./components/Navbar";
import { ChatAssistant } from "./components/ChatAssistant";
import { IconSparkles } from "./components/icons";
import { HomePage } from "./pages/HomePage";
import { AdvancedSearchPage } from "./pages/AdvancedSearchPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { ReserveFlow } from "./pages/ReserveFlow";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { AccountPage } from "./pages/AccountPage";

export default function App() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [route, setRoute] = useState<{ name: string; [k: string]: any }>({ name: "home" });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const [books, setBooks] = useState<any[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hul.books") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return SEED_BOOKS;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  });

  const [viewHistory, setViewHistory] = useState<string[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(VIEWS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("hul.books", JSON.stringify(books)); } catch {}
  }, [books]);

  useEffect(() => {
    const hasCustomApiUrl =
      typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL;
    if (!hasCustomApiUrl) return;

    async function fetchBooksFromApi() {
      try {
        const res = await fetch("/books", { signal: AbortSignal.timeout(3000) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Response is not JSON");
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          setBooks(data);
          console.log("✅ 成功從後端載入書目資料");
        }
      } catch {
        console.info("ℹ️ 使用前端內建資料（後端API未連接）");
      }
    }
    fetchBooksFromApi();
  }, []);

  useEffect(() => {
    const list = readUsers();
    if (!list.some((u) => (u.email || "").toLowerCase() === "user@hul")) {
      writeUsers([{ email: "user@hul", pass: "user123" }, ...list]);
    }
  }, []);

  const recordView = (bookId: string) => {
    setViewHistory((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const next = [bookId, ...arr.filter((id) => id !== bookId)].slice(0, 50);
      try { localStorage.setItem(VIEWS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const openBook = (book: any) => {
    if (!book) return;
    recordView(book.id);
    setRoute({ name: "detail", book });
    setAssistantOpen(false);
  };
  const goHome = () => setRoute({ name: "home" });

  const executeSearch = async (q: any, initFilters?: any) => {
    let searchTerm = "";
    if (typeof q === "string") searchTerm = q;
    else if (q?.term) searchTerm = q.term;
    else if (q?.rows && q.rows.length > 0) searchTerm = q.rows.map((r: any) => r.term).join(" ");

    if (!searchTerm.trim()) { setRoute({ name: "results", q, initFilters }); return; }

    setIsScraping(true);
    try {
      const res = await fetch(`/api/scraper/scrape?q=${encodeURIComponent(searchTerm)}&pages=1`);
      if (!res.ok) throw new Error(`HTTP Error:${res.status}`);
      const data = await res.json();
      if (data.status === "success" && data.data) {
        const scrapedBooks = data.data.map((b: any, index: number) => ({
          id: `ndhu-scraped-${Date.now()}-${index}`,
          title: b.title, author: b.author,
          isbn: b.isbn !== "無ISBN" ? b.isbn : "",
          year: new Date().getFullYear(),
          language: "繁體中文", format: "紙本",
          cover: b.image_url || "https://via.placeholder.com/300x400?text=No+Cover",
          subjects: ["東華大學館藏", "外部抓取"],
          description: "此資料為即時從東華大學圖書館系統跨校抓取之館藏。",
          availability: [{ lib: "東華大學圖書館", callno: "外部館藏", floor: "依東華系統為準", status: b.availability.includes("0 本館藏 可借閱") ? "Check out" : "Available", due: null }],
        }));
        setBooks(scrapedBooks);
      }
    } catch (err) {
      console.error("爬蟲連線失敗", err);
      alert("無法連線到東華大學圖書管爬蟲引擎");
    } finally {
      setIsScraping(false);
      setRoute({ name: "results", q: searchTerm, initFilters });
    }
  };

  const refreshLoans = async () => {
    try {
      if (!token) return;
      const data = await getMyLoans(token);
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) { console.error("載入借閱資料失敗", err); }
  };

  const login = async (email: string, pass: string) => {
    const res = await loginUser({ username: email.trim(), password: pass });
    const cur: AuthUser = { email, roles: ["member"] };
    setUser(cur);
    setToken(res.access_token);
    try { localStorage.setItem(USER_KEY, JSON.stringify(cur)); localStorage.setItem(TOKEN_KEY, res.access_token); } catch {}
    await refreshLoans();
    setRoute({ name: "account" });
  };

  const register = async (email: string, pass: string) => {
    await registerUser({ username: email.trim(), email, password: pass });
    await login(email, pass);
  };

  const logout = () => {
    try { localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); } catch {}
    setUser(null); setToken(null); setLoans([]); goHome();
  };

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      {isScraping && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <IconSparkles className="w-12 h-12 animate-pulse text-orange-400 mb-4" />
          <h2 className="text-xl font-bold">正在從東華大學圖書館抓取資料...</h2>
          <p className="text-sm opacity-80 mt-2">請稍候，這可能需要幾秒鐘</p>
        </div>
      )}

      <Navbar goHome={goHome} onOpenAccount={() => setRoute({ name: "account" })} onOpenAssistant={() => setAssistantOpen(true)} />

      {route.name === "home" && (
        <HomePage books={books} onPickTopic={(t: string) => executeSearch(t)} onOpenBook={openBook}
          onBasicSearch={(q: any) => executeSearch(q)} onOpenAdvanced={() => setRoute({ name: "advanced" })}
          onOpenRecommend={() => setRoute({ name: "recommend" })} />
      )}
      {route.name === "advanced" && (
        <AdvancedSearchPage books={books} onSearch={(q, f) => executeSearch(q, f)} onCancel={goHome} />
      )}
      {route.name === "results" && (
        <SearchResultsPage books={books} query={route.q ?? ""} initFilters={route.initFilters}
          onOpenBook={openBook} onNewSearch={(q: any) => executeSearch(q)} goAdvanced={() => setRoute({ name: "advanced" })} />
      )}
      {route.name === "detail" && (
        <BookDetailPage book={route.book} books={books} onReserve={() => setRoute({ name: "reserve", book: route.book })} onOpenBook={openBook} />
      )}
      {route.name === "reserve" && <ReserveFlow book={route.book} onDone={() => setRoute({ name: "account" })} />}
      {route.name === "recommend" && (
        <RecommendationsPage books={books} history={viewHistory} onOpenBook={openBook} onPickTopic={(t: string) => executeSearch(t)} />
      )}
      {route.name === "account" && (
        <AccountPage user={user} token={token} loans={loans} onLogin={login} onRegister={register} onLogout={logout} onRefreshLoans={refreshLoans} />
      )}

      <ChatAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} books={books} onOpenBook={openBook}
        onOpenResults={(q: any) => { setAssistantOpen(false); executeSearch(q); }} />

      <footer className="border-t border-gray-200 mt-10 py-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Hualien United Libraries — Demo UI (前台)
      </footer>
    </div>
  );
}
