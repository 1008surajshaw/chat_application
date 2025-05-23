import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClass = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  }[size]

  return (
    <Loader2 className={`animate-spin ${sizeClass}`} />
  )
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}