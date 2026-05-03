import { classNames } from "../../utils/helpers";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-4" aria-label="流程步驟">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={classNames(
              "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
              i < current
                ? "bg-blue-600 text-white"
                : i === current
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-500",
            )}
          >
            {i + 1}
          </span>
          <span className={classNames("text-sm", i === current ? "text-blue-700 font-medium" : "text-gray-600")}>
            {s}
          </span>
          {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
        </li>
      ))}
    </ol>
  );
}
