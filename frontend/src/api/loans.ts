const API_BASE = "/api";

export async function getMyLoans(token: string) {
  const res = await fetch(`${API_BASE}/loans/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  if (!res.ok) {
    throw new Error("無法取得借閱資料");
  }

  return await res.json();
}

export async function createLoan(token: string, loanData: { 
  book_title?: string; 
  book_isbn?: string; 
  pickup_library: string; 
  pickup_date: string 
}) {
  const res = await fetch(`${API_BASE}/loans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(loanData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "預約/借閱失敗");
  }

  return await res.json();
}
