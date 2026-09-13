"use client";

import {
  Banknote,
  Car,
  Coins,
  CreditCard,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  HelpCircle,
  Home,
  Laptop,
  PiggyBank,
  Receipt,
  ShoppingBag,
  Tag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  HelpCircle,
  Banknote,
  Laptop,
  TrendingUp,
  Gift,
  Coins,
  Wallet,
  CreditCard,
  PiggyBank,
  Home,
  Tag,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "size-4" }: CategoryIconProps) {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} />;
}
