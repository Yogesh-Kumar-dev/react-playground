import { useState, useCallback, useRef, useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldLabel } from './FieldLabel'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface ComboboxFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function ComboboxField({ field, disabled }: ComboboxFieldProps) {
    const { setValue } = useFormContext()
    const currentValue = useWatch({ name: field.name }) as string | undefined
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const options = field.options ?? []
    const selectedLabel =
        options.find((o) => o.value === currentValue)?.label ?? ''

    const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
    )

    const handleSelect = useCallback(
        (value: string) => {
            setValue(field.name, value, { shouldValidate: true })
            setOpen(false)
            setQuery('')
        },
        [field.name, setValue]
    )

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setOpen(false)
                setQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="space-y-1.5" ref={containerRef}>
            <FieldLabel label={field.label} required={field.required} />
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setOpen(!open)}
                    disabled={disabled}
                    className={cn(
                        'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors',
                        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        !selectedLabel && 'text-muted-foreground'
                    )}
                >
                    <span className="truncate">
                        {selectedLabel || (field.placeholder ?? 'Search...')}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                </button>
                {open && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
                        <div className="p-1">
                            <Input
                                placeholder="Type to search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="h-7 border-0 bg-transparent focus-visible:ring-0"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                            {filtered.length === 0 ? (
                                <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                    No results found.
                                </p>
                            ) : (
                                filtered.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(opt.value)
                                        }
                                        className={cn(
                                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none',
                                            'hover:bg-accent hover:text-accent-foreground',
                                            currentValue === opt.value &&
                                                'bg-accent text-accent-foreground'
                                        )}
                                    >
                                        <Check
                                            className={cn(
                                                'size-4 shrink-0',
                                                currentValue === opt.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        {opt.label}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            <FieldError name={field.name} />
        </div>
    )
}
