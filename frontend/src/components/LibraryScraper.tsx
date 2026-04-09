import React, { useState } from 'react';

// 1. 定義從後端傳來的書籍資料結構 (TypeScript 的好處就是不會抓錯欄位)
interface Book {
  title: string;
  author: string;
  image_url: string;
  isbn: string;
  availability: string;
  source_page?: number;
}

const LibraryScraper: React.FC = () => {
  // 狀態管理
  const [keyword, setKeyword] = useState<string>('C語言');
  const [pages, setPages] = useState<number>(1); // 預設先抓 1 頁就好，比較快
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // 呼叫後端 API 的主函式
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    setMessage(`正在潛入圖書館抓取 ${pages} 頁資料，請稍候... 🕵️‍♂️`);
    setBooks([]);

    try {
      // 呼叫你剛剛寫好的 Python 爬蟲 API (注意路徑是否正確)
      const response = await fetch(`/api/scraper/scrape?q=${encodeURIComponent(keyword)}&pages=${pages}`);
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        if (data.data.length > 0) {
          setBooks(data.data);
          setMessage(`抓取成功！共找到 ${data.data.length} 本書 🎉`);
        } else {
          setMessage(data.message || '找不到相關書籍。');
        }
      } else {
        setMessage(data.message || '後端回傳錯誤');
      }
    } catch (error) {
      console.error(error);
      setMessage('無法連線到後端 API，請確認 Docker 是否有啟動！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>
        📚 東華大學館藏即時抓取引擎
      </h2>

      {/* 控制面板 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="輸入書名、作者或 ISBN..."
          style={{ padding: '8px', fontSize: '16px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <select 
          value={pages} 
          onChange={(e) => setPages(Number(e.target.value))}
          style={{ padding: '8px', fontSize: '16px', borderRadius: '4px' }}
        >
          <option value={1}>抓取 1 頁</option>
          <option value={3}>抓取 3 頁</option>
          <option value={5}>抓取 5 頁</option>
        </select>
        <button 
          onClick={handleSearch} 
          disabled={loading}
          style={{ 
            padding: '8px 20px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#ccc' : '#0056b3', color: 'white', border: 'none', borderRadius: '4px'
          }}
        >
          {loading ? '駭入中...' : '開始搜尋'}
        </button>
      </div>

      {/* 訊息提示區 */}
      {message && (
        <div style={{ padding: '10px', backgroundColor: '#e9f5ff', color: '#004085', borderRadius: '4px', marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {/* 書籍網格展示區 (CSS Grid 排版) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {books.map((book, index) => (
          <div key={index} style={{ 
            border: '1px solid #ddd', borderRadius: '8px', padding: '15px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
            backgroundColor: '#fff'
          }}>
            {/* 封面圖片 (防呆機制：如果沒有圖片就顯示灰底框) */}
            <div style={{ height: '200px', backgroundColor: '#f4f4f4', marginBottom: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '4px', overflow: 'hidden' }}>
              {book.image_url ? (
                <img src={book.image_url} alt={book.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ color: '#999' }}>無封面圖</span>
              )}
            </div>
            
            {/* 書籍資訊 */}
            <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333', lineHeight: '1.4' }}>{book.title}</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}><strong>作者：</strong>{book.author}</p>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#888' }}><strong>ISBN：</strong>{book.isbn}</p>
            
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
              <p style={{ margin: '0', fontSize: '13px', color: book.availability.includes('0 本館藏 可借閱') ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                {book.availability}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryScraper;
