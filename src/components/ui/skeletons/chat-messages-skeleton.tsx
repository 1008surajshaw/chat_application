import { Skeleton } from "@/components/ui/skeleton";

export function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-2 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-end max-w-[70%]`}>
              {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
              <div>
                <Skeleton className={`h-${4 + (i % 3)} w-${20 + (i * 10)} rounded-lg`} />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}