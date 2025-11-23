import React, { useState } from 'react';
// 如果您還沒設定路由，可以先用 window.location.href 跳轉
// import { useNavigate } from 'react-router-dom'; 

const LoginPage = () => {
  // const navigate = useNavigate(); // 路由跳轉用

  // 1. 定義狀態 (對應您的 Figma 輸入框)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. 清除按鈕的功能
  const handleClear = () => {
    setEmail('');
    setPassword('');
    setError('');
  };

  // 3. 登入按鈕的功能 (核心邏輯)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 發送請求給後端 (注意：這裡是相對路徑，依賴 Nginx 轉發)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 注意：您的後端目前接收的是 'username'，前端雖然顯示 Email，但我們這裡要對應後端欄位
          username: email, 
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- 登入成功 ---
        console.log('登入成功:', data);
        
        // 【關鍵步驟】將 Token 存入 LocalStorage
        localStorage.setItem('access_token', data.access_token);
        
        // 跳轉到首頁 (或個人頁面)
        alert('登入成功！');
        window.location.href = '/'; 
        // navigate('/'); // 如果有用 react-router
      } else {
        // --- 登入失敗 ---
        setError(data.error || '登入失敗，請檢查帳號密碼');
      }
    } catch (err) {
      console.error('連線錯誤:', err);
      setError('伺服器連線錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 以下是 UI 部分 (使用內聯樣式模擬 Tailwind，方便您直接使用) ---
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb', // 淺灰背景
      fontFamily: 'sans-serif',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '2rem',
    },
    card: {
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '100%',
      maxWidth: '450px',
      border: '1px solid #e5e7eb',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '9999px', // 圓角
      border: '1px solid #d1d5db',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box', // 確保 padding 不會撐大寬度
    },
    errorMsg: {
      color: '#ef4444',
      textAlign: 'center',
      fontSize: '0.875rem',
      marginBottom: '1rem',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
    },
    btnLogin: {
      flex: 1,
      backgroundColor: '#3b82f6', // 藍色
      color: 'white',
      padding: '0.75rem',
      borderRadius: '9999px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      transition: 'background-color 0.2s',
    },
    btnClear: {
      flex: 1,
      backgroundColor: 'white',
      color: '#374151',
      padding: '0.75rem',
      borderRadius: '9999px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    footer: {
      marginTop: '3rem',
      color: '#6b7280',
      fontSize: '0.875rem',
    }
  };

  return (
    <div style={styles.container}>
      {/* 標題：我的帳戶 */}
      <h1 style={styles.title}>我的帳戶</h1>

      <div style={styles.card}>
        <form onSubmit={handleLogin}>
          
          {/* Email 輸入框 */}
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email ( user@hul )"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 密碼輸入框 */}
          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="密碼 ( user123 )"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 錯誤訊息 */}
          {error && <p style={styles.errorMsg}>{error}</p>}

          {/* 按鈕區塊 */}
          <div style={styles.buttonGroup}>
            <button 
              type="submit" 
              style={{...styles.btnLogin, opacity: isLoading ? 0.7 : 1}}
              disabled={isLoading}
            >
              {isLoading ? '登入中...' : '登入'}
            </button>
            
            <button 
              type="button" 
              onClick={handleClear} 
              style={styles.btnClear}
            >
              清除
            </button>
          </div>
        </form>
      </div>

      <footer style={styles.footer}>
        © 2025 Hualien United Libraries — Demo UI (前台)
      </footer>
    </div>
  );
};

export default LoginPage;
