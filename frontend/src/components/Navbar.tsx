import { Button } from "./ui/Button";
import { IconSparkles } from "./icons";

export function Navbar({
  goHome,
  onOpenAccount,
  onOpenAssistant,
}: {
  goHome: () => void;
  onOpenAccount: () => void;
  onOpenAssistant: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <button onClick={goHome} className="flex items-center gap-2 font-bold text-gray-900">
          <span className="inline-flex w-8 h-8 rounded-xl bg-blue-600 text-white items-center justify-center">HL</span>
          <span className="hidden sm:block">Hualien United Libraries</span>
        </button>
        <div className="flex-1" />
        <Button variant="accent" size="sm" onClick={onOpenAssistant}>
          <span className="inline-flex items-center gap-1.5">
            <IconSparkles className="w-4 h-4" />
            AI 小助手
          </span>
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenAccount}>
          我的帳戶
        </Button>
      </div>
    </header>
  );
}
