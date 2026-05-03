import React, { useState, useEffect } from "react";
import { loginUser, registerUser } from "./api/auth";
import { AuthUser, Loan } from "./types";
import { USER_KEY, TOKEN_KEY, VIEWS_KEY, SEED_BOOKS } from "./constants";
import { Navbar } from "./components/Navbar";
import { ChatAssistant } from "./components/ChatAssistant";
import { HomePage } from "./pages/HomePage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { BookDetailPage } from "./pages/BookDetailPage";
import { AdvancedSearchPage } from "./pages/AdvancedSearchPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { AccountPage } from "./pages/AccountPage";

export default function App() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [route, setRoute] = useState<{ name: string; [k: string]: any }>({ name: "home" });
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [books, setBooks] = useState<any[]>(SEED_BOOKS);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // 👤 使用者登入狀態
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // 🌟 [AI 模組] 獲取個人化推薦 (機器 B)
  const fetchRecs = async (uid: number) => {
    try {
      const res = await fetch(`/ai-api/recommend/${uid}`);
      const result = await res.json();
      if (result && result.status === "success" && Array.isArray(result.recommendations)) {
        setRecommendations(result.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setRecommendations([]);
    }
  };

  useEffect(() => {
    if (user && user.id) fetchRecs(user.id);
  }, [user]);

  // 🕷️ [爬蟲核心] 普通搜尋：對接 scraper.py
  const executeSearch = async (q: any, initFilters?: any) => {
    let searchTerm = typeof q === "string" ? q : q?.term || "";
    if (!searchTerm.trim()) return;

    setIsScraping(true); 
    try {
      const res = await fetch(`/api/scraper/scrape?q=${encodeURIComponent(searchTerm)}&pages=3`);
      if (res.ok) {
        const result = await res.json();
        if (result && result.status === "success" && Array.isArray(result.data)) {
          const mappedBooks = result.data.map((b: any, index: number) => ({
            ...b,
            id: b.isbn && b.isbn !== "無 ISBN" ? b.isbn : `scraped-${index}-${Date.now()}`,
            cover: b.image_url || "", 
            year: b.year || 2024,
            // 🌟 核心修正：將字串轉換為陣列，防止 SearchResultsPage 崩潰
            availability: typeof b.availability === 'string' 
              ? [{ lib: "東華大學圖書館", status: b.availability.includes("可借閱") ? "Available" : "Checked out", raw: b.availability }]
              : (Array.isArray(b.availability) ? b.availability : [])
          }));
          setBooks(mappedBooks);
        } else {
          setBooks([]); 
        }
      }
    } catch (err) {
      console.warn("搜尋失敗", err);
      setBooks([]); 
    } finally {
      setIsScraping(false);
      setRoute({ name: "results", q: searchTerm, initFilters });
    }
  };

  const openBook = (book: any) => {
    if (!book) return;
    const targetId = book.book_id || book.id;
    if (user && user.id) {
      fetch('/ai-api/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, book_id: targetId, rating: 5 })
      }).then(() => fetchRecs(user.id));
    }
    setRoute({ name: "detail", book });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null); setToken(null); setRecommendations([]);
    setRoute({ name: "home" });
  };

  // 🛡️ 確保傳下去的永遠是陣列
  const safeBooks = Array.isArray(books) ? books : [];
  const safeRecs = Array.isArray(recommendations) ? recommendations : [];

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      {isScraping && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold tracking-widest">正在爬取東華大學館藏...</h2>
        </div>
      )}

      <Navbar goHome={() => setRoute({ name: "home" })} onOpenAccount={() => setRoute({ name: "account" })} onOpenAssistant={() => setAssistantOpen(true)} />

      {route.name === "home" && (
        <HomePage 
          books={safeBooks} recommendations={safeRecs}
	  recommendations={safeRecs}
          onPickTopic={executeSearch} onOpenBook={openBook}
          onBasicSearch={executeSearch} 
          onOpenAdvanced={() => setRoute({ name: "advanced" })}
        />
      )}

      {route.name === "results" && (
        <SearchResultsPage books={safeBooks} query={route.q} onOpenBook={openBook} onNewSearch={executeSearch} goAdvanced={() => setRoute({ name: "advanced" })} />
      )}

      {route.name === "advanced" && (
        <AdvancedSearchPage books={safeBooks} onSearch={executeSearch} onCancel={() => setRoute({ name: "home" })} />
      )}

      {route.name === "detail" && (
        <BookDetailPage book={route.book} books={safeBooks} onOpenBook={openBook} />
      )}

      {route.name === "account" && (
        <AccountPage user={user} token={token} onLogout={logout} onLogin={() => {}} onRegister={() => {}} loans={[]} onRefreshLoans={() => {}} />
      )}

      <ChatAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} books={safeBooks} onOpenBook={openBook} onOpenResults={executeSearch} />
    </div>
  );
}
