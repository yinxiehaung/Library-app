const API_BASE = "/api/auth";

// 定義登入需要的資料型別 (對應 Python 的 login_payload)
interface LoginCredentials {
  username: string;
  password: string;
}

// 定義註冊需要的資料型別 (對應 Python 的 register_payload)
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// 定義後端回傳的錯誤格式 (你的 Python code return {"error": "..."})
interface ApiError {
  error?: string;
  message?: string;
}

/**
 * 使用者登入
 * 對應 Python: @auth_ns.route('/login')
 */
export async function loginUser(credentials: LoginCredentials) {
  // 發送 POST 請求到 /api/auth/login
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 對應 Python: data = request.get_json()
    // Python 預期收到: { username, password }
    body: JSON.stringify(credentials),
  });

  // 處理錯誤 (例如 401 帳密錯誤)
  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as ApiError;
    // 優先顯示後端回傳的 "error" 欄位，如果沒有則顯示預設訊息
    throw new Error(errorData.error || errorData.message || "登入失敗");
  }

  // 成功：回傳 JSON (包含 access_token)
  return await res.json();
}

/**
 * 使用者註冊
 * 對應 Python: @auth_ns.route('/register')
 */
export async function registerUser(userData: RegisterData) {
  // 發送 POST 請求到 /api/auth/register
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 對應 Python 預期: { username, email, password }
    body: JSON.stringify(userData),
  });

  // 處理錯誤 (例如 409 已被註冊)
  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as ApiError;
    // 你的 Python code 回傳的是 {"error": "使用者名稱已被註冊"}
    throw new Error(errorData.error || "註冊失敗");
  }

  // 成功：回傳 JSON (message: "使用者建立成功")
  return await res.json();
}
