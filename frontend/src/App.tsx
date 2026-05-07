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

  // 👤 狀態初始化
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // 🌟 [AI 推薦]
  const fetchRecs = async (uid: number) => {
    try {
      const res = await fetch(`/ai-api/recommend/${uid}`);
      const result = await res.json();
      if (result && result.status === "success" && Array.isArray(result.recommendations)) {
        setRecommendations(result.recommendations);
      } else { setRecommendations([]); }
    } catch { setRecommendations([]); }
  };

  useEffect(() => {
    if (user && user.id) fetchRecs(user.id);
  }, [user]);

  // 🕷️ [爬蟲]
  const executeSearch = async (q: any, initFilters?: any) => {
    let searchTerm = typeof q === "string" ? q : q?.term || "";
    if (!searchTerm.trim()) return;
    setIsScraping(true); 
    try {
      const res = await fetch(`/api/scraper/scrape?q=${encodeURIComponent(searchTerm)}&pages=3`);
      const result = await res.json();
      if (result?.status === "success" && Array.isArray(result.data)) {
        const mapped = result.data.map((b: any, i: number) => ({
          ...b,
          id: b.isbn && b.isbn !== "無 ISBN" ? b.isbn : `scraped-${i}-${Date.now()}`,
          cover: b.image_url || "", 
          availability: typeof b.availability === 'string' 
            ? [{ lib: "東華大學圖書館", status: b.availability.includes("可借閱") ? "Available" : "Checked out" }]
            : (Array.isArray(b.availability) ? b.availability : [])
        }));
        setBooks(mapped);
      }
    } catch (err) { console.warn(err); } 
    finally { setIsScraping(false); setRoute({ name: "results", q: searchTerm, initFilters }); }
  };

  // 🌟 [核心登入修正] - 這是解決「不跳轉/不顯示登入」的關鍵
  const handleLogin = async (email: string, pass: string) => {
    try {
      const username = email.trim().split('@')[0];
      // 呼叫你的 auth.ts
      const res = await loginUser({ username, password: pass });
      
      // 🛑 核心保險：如果後端沒給完整 user，我們強行構造一個符合 AuthUser 型別的物件
      const userData = res.user || { 
        id: res.user_id || Date.now(), 
        email: email.trim(), 
        username: username,
        roles: ["member"] 
      };
      
      const jwtToken = res.access_token || res.token;

      // 更新 React 狀態，這會觸發 AccountPage 重新渲染
      setUser(userData);
      setToken(jwtToken);
      
      // 儲存到 LocalStorage
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      localStorage.setItem(TOKEN_KEY, jwtToken);

      console.log("登入確認成功，狀態已更新：", userData);

      // 強制換頁回「帳戶」或「首頁」
      setRoute({ name: "account" }); 
    } catch (err: any) {
      alert(err.message || "登入失敗");
    }
  };

  const handleRegister = async (email: string, pass: string) => {
    try {
      const username = email.trim().split('@')[0];
      await registerUser({ username, email: email.trim(), password: pass });
      alert("註冊成功！正在為您自動登入...");
      await handleLogin(email, pass);
    } catch (err: any) {
      alert(err.message || "註冊失敗");
    }
  };

  const openBook = (book: any) => {
    if (!book) return;
    const targetId = book.book_id || book.id;
    if (user?.id) {
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

      <Navbar 
        goHome={() => setRoute({ name: "home" })} 
        onOpenAccount={() => setRoute({ name: "account" })} 
        onOpenAssistant={() => setAssistantOpen(true)} 
        onOpenRecommendations={() => setRoute({ name: "recommendations" })}
      />

      {route.name === "home" && (
        <HomePage books={safeBooks} recommendations={safeRecs} onPickTopic={executeSearch} onOpenBook={openBook} onBasicSearch={executeSearch} onOpenAdvanced={() => setRoute({ name: "advanced" })} />
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

      {route.name === "recommendations" && (
        <RecommendationsPage recommendations={safeRecs} onOpenBook={openBook} />
      )}

      {route.name === "account" && (
        <AccountPage 
          user={user} token={token} onLogout={logout} 
          onLogin={handleLogin} onRegister={handleRegister} 
          loans={loans} onRefreshLoans={() => {}} 
        />
      )}

      <ChatAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} books={safeBooks} onOpenBook={openBook} onOpenResults={executeSearch} />
    </div>
  );
}
