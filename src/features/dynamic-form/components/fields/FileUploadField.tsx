import { useCallback, useState, useRef, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import { FieldError } from './FieldError'
import type { FieldSchema } from '../../schema'

interface FileUploadFieldProps {
    field: FieldSchema
    disabled?: boolean
}

export function FileUploadField({ field, disabled }: FileUploadFieldProps) {
    const { setValue } = useFormContext()
    const inputRef = useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const files = useWatch({ name: field.name }) as File | File[] | undefined

    const fileList: File[] = useMemo(
        () =>
            Array.isArray(files)
                ? files
                : files
                  ? [files]
                  : [],
        [files]
    )

    const handleChange = useCallback(
        (newFiles: FileList | null) => {
            if (!newFiles) return
            const arr = Array.from(newFiles)
            setValue(field.name, field.multiple ? arr : arr[0], {
                shouldValidate: true,
            })
        },
        [field.multiple, field.name, setValue]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragOver(false)
            if (disabled) return
            handleChange(e.dataTransfer.files)
        },
        [disabled, handleChange]
    )

    const handleRemove = useCallback(
        (idx: number) => {
            if (field.multiple) {
                const remaining = fileList.filter((_, i) => i !== idx)
                setValue(field.name, remaining, { shouldValidate: true })
            } else {
                setValue(field.name, undefined, { shouldValidate: true })
            }
        },
        [field.multiple, field.name, fileList, setValue]
    )

    return (
        <div className="space-y-1.5">
            <Label>{field.label}</Label>
            <div
                onDragOver={(e) => {
                    e.preventDefault()
                    if (!disabled) setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                    disabled
                        ? 'cursor-not-allowed opacity-50'
                        : isDragOver
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:border-muted-foreground/50'
                }`}
            >
                <Upload className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Drag & drop or click to upload
                </p>
                {field.accept && (
                    <p className="text-xs text-muted-foreground/70">
                        Accepted: {field.accept}
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={field.accept}
                    multiple={field.multiple}
                    disabled={disabled}
                    onChange={(e) => handleChange(e.target.files)}
                />
            </div>
            {fileList.length > 0 && (
                <ul className="mt-2 space-y-1">
                    {fileList.map((file, idx) => (
                        <li
                            key={`${file.name}-${idx}`}
                            className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm"
                        >
                            <span className="truncate">
                                {file.name}{' '}
                                <span className="text-muted-foreground">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemove(idx)
                                }}
                                disabled={disabled}
                            >
                                <X className="size-3" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
            <FieldError name={field.name} />
        </div>
    )
}
