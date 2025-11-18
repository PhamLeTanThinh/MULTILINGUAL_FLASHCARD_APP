import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('vi-VN');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}