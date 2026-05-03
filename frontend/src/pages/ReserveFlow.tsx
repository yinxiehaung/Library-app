import { useState } from "react";
import { createLoan } from "../api/loans";
import { TOKEN_KEY } from "../constants";
import { Stepper } from "../components/ui/Stepper";
import { Button } from "../components/ui/Button";

export function ReserveFlow({ book, onDone }: { book: any; onDone: () => void }) {
  const steps = ["選取書館", "選日期", "確認", "成功"];
  const [step, setStep] = useState(0);
  const [lib, setLib] = useState("");
  const [date, setDate] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (!lib || !date) return;
    try {
      const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem("hul.token");
      if (!token) { alert("請先登入才能預約 / 借閱"); return; }
      await createLoan(token, { book_title: book.title, book_isbn: book.isbn, pickup_library: lib, pickup_date: date });
      alert("預約 / 借閱成功，已建立借閱紀錄！");
      setStep(3);
    } catch (err: any) {
      console.error(err);
      alert("預約 / 借閱失敗：" + (err?.message || "請稍後再試，或聯絡管理員"));
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
      <Stepper steps={steps} current={step} />
      <div className="mt-6 border border-gray-200 rounded-2xl bg-white p-6 space-y-4">
        {step === 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">請選擇取書館：</div>
            <select className="w-full border border-gray-300 rounded-2xl px-3 py-2 bg-white" value={lib} onChange={(e) => setLib(e.target.value)}>
              <option value="">選擇館別</option>
              {(book.availability || []).map((a: any) => <option key={a.lib} value={a.lib}>{a.lib}</option>)}
            </select>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">選擇取書日期：</div>
            <input type="date" className="w-full border border-gray-300 rounded-2xl px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2 text-sm">
            <div>書名：<span className="font-medium">{book.title}</span></div>
            <div>取書館：<span className="font-medium">{lib || "未選擇"}</span></div>
            <div>日期：<span className="font-medium">{date || "未選擇"}</span></div>
            <div className="pt-2 text-gray-600">確認後將發送通知（Email/LINE）。</div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto w-32 h-32 bg-gray-100 rounded-2xl" aria-label="QR code placeholder" />
            <p className="mt-3 text-green-700 font-medium">預約成功！</p>
            <p className="text-sm text-gray-600">請於 3 天內到館取書，逾期預約將自動取消（不影響借閱權益）。到館請出示 QR 碼或條碼。</p>
          </div>
        )}
        <div className="pt-2 flex items-center justify-between">
          <Button variant="secondary" onClick={back} disabled={step === 0}>上一步</Button>
          {step < 2 && <Button onClick={next} disabled={step === 0 && !lib}>下一步</Button>}
          {step === 2 && <Button onClick={handleConfirm} disabled={!lib || !date}>確認</Button>}
          {step === 3 && <Button onClick={onDone}>完成</Button>}
        </div>
      </div>
    </main>
  );
}
