import { Skeleton } from '@/components/ui/skeleton'
import type { Feedback } from '@/features/web-components/api'
import { FeedbackCard } from '@/features/web-components/components/feedback-elements'

const SKELETON_COUNT = 4

type FeedbackListProps = {
    items: Feedback[]
    listError: string
    isLoading: boolean
}

export default function FeedbackList({
    items,
    listError,
    isLoading,
}: FeedbackListProps) {
    if (listError) {
        return <p className="text-sm text-destructive">{listError}</p>
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading
                ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                      <div
                          key={i}
                          className="space-y-3 rounded-xl border p-4"
                      >
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-32" />
                      </div>
                  ))
                : items.map((item) => (
                      <FeedbackCard key={item.id} feedback={item} />
                  ))}
        </div>
    )
}
