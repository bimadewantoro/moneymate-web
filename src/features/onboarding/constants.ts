// Default categories that will be shown in the onboarding wizard
export const DEFAULT_ONBOARDING_CATEGORIES = [
  // Income categories
  { name: "Salary", type: "income" as const, color: "#22c55e", icon: "💼" },
  { name: "Freelance", type: "income" as const, color: "#10b981", icon: "💻" },
  { name: "Investment", type: "income" as const, color: "#14b8a6", icon: "📈" },
  { name: "Gift", type: "income" as const, color: "#06b6d4", icon: "🎁" },
  { name: "Other Income", type: "income" as const, color: "#0ea5e9", icon: "💰" },
  // Expense categories
  { name: "Food & Dining", type: "expense" as const, color: "#f97316", icon: "🍔" },
  { name: "Transportation", type: "expense" as const, color: "#ef4444", icon: "🚗" },
  { name: "Shopping", type: "expense" as const, color: "#ec4899", icon: "🛒" },
  { name: "Entertainment", type: "expense" as const, color: "#a855f7", icon: "🎮" },
  { name: "Bills & Utilities", type: "expense" as const, color: "#8b5cf6", icon: "📄" },
  { name: "Healthcare", type: "expense" as const, color: "#6366f1", icon: "🏥" },
  { name: "Education", type: "expense" as const, color: "#3b82f6", icon: "📚" },
  { name: "Other Expense", type: "expense" as const, color: "#64748b", icon: "📦" },
];
