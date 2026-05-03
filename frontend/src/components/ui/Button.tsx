import { classNames } from "../../utils/helpers";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: any) {
  const base =
    "inline-flex items-center justify-center rounded-2xl font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition";
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };
  const variants: Record<string, string> = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
    secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400",
    ghost:     "bg-transparent text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-600",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    accent:    "bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500",
  };
  return (
    <button className={classNames(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
