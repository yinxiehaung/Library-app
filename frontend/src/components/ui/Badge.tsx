import { classNames } from "../../utils/helpers";

export function Badge({ children, tone = "neutral" }: any) {
  const tones: Record<string, string> = {
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warn:    "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger:  "bg-red-100 text-red-800 border-red-200",
    info:    "bg-blue-100 text-blue-800 border-blue-200",
  };
  return (
    <span className={classNames("inline-flex items-center px-2 py-1 rounded-xl text-xs", tones[tone])}>
      {children}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: string }) {
  switch (status) {
    case "Available":
    case "On shelf":
      return <Badge tone="success">可借 / On shelf</Badge>;
    case "On hold":
      return <Badge tone="warn">預約中 / On hold</Badge>;
    case "Checked out":
      return <Badge tone="danger">借出中 / Checked out</Badge>;
    default:
      return <Badge>未知</Badge>;
  }
}


