import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function generateUPIIntentUrl(params: {
  pa: string; // VPA
  pn: string; // Payee Name
  am: number; // Amount
  tn?: string; // Note / Txn Note
  tr?: string; // Txn Ref
}): string {
  const { pa, pn, am, tn = "Bill Payment", tr = `RESTOS-${Date.now()}` } = params;
  const encodedPn = encodeURIComponent(pn);
  const encodedTn = encodeURIComponent(tn);
  return `upi://pay?pa=${pa}&pn=${encodedPn}&am=${am.toFixed(2)}&cu=INR&tn=${encodedTn}&tr=${tr}`;
}
