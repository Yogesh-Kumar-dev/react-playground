// clsx: join conditional classes (e.g. clsx(isActive && 'bg-blue-500', isDisabled && 'opacity-50'))
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// clsx for conditionals, twMerge to dedupe conflicting Tailwind classes (e.g. px-4 vs px-8)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
