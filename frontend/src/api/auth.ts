const API_BASE = "/api/auth";

/**
 * 使用者登入
 * 接收物件格式: { username: string, password: string }
 */
export async function loginUser(credentials: any) {
  // 檢查傳進來的是不是物件，如果是，取出 email (或者是已經切好的 username)
  const identifier = typeof credentials === 'string' ? credentials : (credentials.username || credentials.email);
  
  // 確保 identifier 是字串才執行 split
  const finalUsername = identifier.includes('@') ? identifier.split('@')[0] : identifier;

  const payload = {
    username: finalUsername,
    password: credentials.password || credentials.pass
  };

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "登入失敗");
  }
  return await res.json();
}

/**
 * 使用者註冊
 * 接收物件格式: { username: string, email: string, password: string }
 */
export async function registerUser(userData: any) {
  // 自動處理 username，防止傳進來的是 email 物件
  const emailStr = userData.email || "";
  const finalUsername = userData.username || emailStr.split('@')[0];

  const payload = {
    username: finalUsername,
    email: emailStr,
    password: userData.password || userData.pass
  };

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "註冊失敗");
  }
  return await res.json();
}
