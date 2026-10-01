import clsx from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function platformFeePercent() {
  return Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENT || 15);
}

export function calcFees(amount) {
  const feePercent = platformFeePercent();
  const platformFee = Math.round((amount * feePercent) / 100);
  const creatorPayout = amount - platformFee;
  return { feePercent, platformFee, creatorPayout };
}

export const CATEGORIES = [
  { id: "product-ads", label: "Product Ads" },
  { id: "social-shorts", label: "Social Shorts" },
  { id: "explainers", label: "Explainers" },
  { id: "ugc", label: "UGC" },
  { id: "brand-films", label: "Brand Films" },
  { id: "motion-graphics", label: "Motion Graphics" },
  { id: "other", label: "Other" },
];

export function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

export function serialize(doc) {
  return JSON.parse(JSON.stringify(doc));
}
