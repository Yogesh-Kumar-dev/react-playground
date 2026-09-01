import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const STEP_COLORS = [
    '#38bdf8',
    '#34d399',
    '#fbbf24',
]

function getStepButtonStyle(color: string, isCompleted: boolean, isCurrent: boolean): React.CSSProperties | undefined {
    if (isCompleted) {
        return { backgroundColor: color, borderColor: color, color: '#fff' }
    }
    if (isCurrent) {
        return { borderColor: color, color, backgroundColor: `${color}1a` }
    }
    return undefined
}

interface StepIndicatorProps {
    steps: { title: string }[]
    currentStep: number
    completedSteps: Set<number>
    onStepClick?: (step: number) => void
}

export function StepIndicator({ steps, currentStep, completedSteps, onStepClick }: Readonly<StepIndicatorProps>) {
    return (
        <div className="flex items-center gap-2 justify-center">
            {steps.map((step, idx) => {
                const isCompleted = completedSteps.has(idx)
                const isCurrent = idx === currentStep
                const isClickable = isCompleted || idx < currentStep
                const color = STEP_COLORS[idx % STEP_COLORS.length]

                return (
                    <div key={step.title} className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick?.(idx)}
                                disabled={!isClickable}
                                style={getStepButtonStyle(color, isCompleted, isCurrent)}
                                className={cn(
                                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                                    !isCompleted && !isCurrent && 'border-input text-muted-foreground',
                                    isClickable && 'cursor-pointer hover:opacity-80',
                                    !isClickable && 'cursor-default'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="size-3.5" />
                                ) : (
                                    idx + 1
                                )}
                            </button>
                            <span
                                style={isCurrent ? { color } : undefined}
                                className={cn(
                                    'text-sm font-medium hidden sm:inline',
                                    !isCurrent && 'text-muted-foreground'
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                style={{
                                    backgroundColor: idx < currentStep ? color : undefined,
                                }}
                                className={cn(
                                    'h-px w-8',
                                    idx >= currentStep && 'bg-input'
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}
