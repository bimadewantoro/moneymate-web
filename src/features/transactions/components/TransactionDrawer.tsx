"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Loader2,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Camera,
  ImageUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { createTransactionAction } from "@/features/transactions/actions";
import {
  scanReceipt,
  type ReceiptData,
} from "@/features/ai/actions/scan-receipt";
import { useTransactionDrawer } from "@/features/transactions/contexts/TransactionDrawerContext";
import { getCurrencySymbol, formatCurrency } from "@/lib/utils/currency";

/* ─── Types ─────────────────────────────── */

interface Account {
  id: string;
  name: string;
  type: "bank" | "cash" | "e-wallet" | "investment" | "other";
  currency: string;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string | null;
}

interface TransactionDrawerProps {
  accounts: Account[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}

/* ─── Constants ─────────────────────────── */

const ACCOUNT_ICONS: Record<string, string> = {
  bank: "🏦",
  cash: "💵",
  "e-wallet": "📱",
  investment: "📈",
  other: "💳",
};

const TYPE_CONFIG = {
  expense: {
    label: "Expense",
    icon: ArrowDownLeft,
    activeTab: "bg-red-500 text-white shadow-md shadow-red-500/25",
    focusRing:
      "focus-within:ring-2 focus-within:ring-red-500/15 focus-within:border-red-300",
    submitBtn:
      "bg-red-500 hover:bg-red-600 active:bg-red-700 shadow-lg shadow-red-500/20",
    chipSelected: "border-red-500 bg-red-50 text-red-700 shadow-sm",
  },
  income: {
    label: "Income",
    icon: ArrowUpRight,
    activeTab: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
    focusRing:
      "focus-within:ring-2 focus-within:ring-emerald-500/15 focus-within:border-emerald-300",
    submitBtn:
      "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-lg shadow-emerald-500/20",
    chipSelected: "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowRightLeft,
    activeTab: "bg-blue-500 text-white shadow-md shadow-blue-500/25",
    focusRing:
      "focus-within:ring-2 focus-within:ring-blue-500/15 focus-within:border-blue-300",
    submitBtn:
      "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-lg shadow-blue-500/20",
    chipSelected: "border-blue-500 bg-blue-50 text-blue-700 shadow-sm",
  },
} as const;

type TransactionType = keyof typeof TYPE_CONFIG;

/* ═══════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════ */

export function TransactionDrawer({
  accounts,
  incomeCategories,
  expenseCategories,
}: TransactionDrawerProps) {
  const { open, setOpen } = useTransactionDrawer();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [activeType, setActiveType] = useState<TransactionType>("expense");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showScanOptions, setShowScanOptions] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories =
    activeType === "income" ? incomeCategories : expenseCategories;
  const config = TYPE_CONFIG[activeType];

  /* ── Effects ── */

  useEffect(() => {
    if (open) {
      setShowSuccess(false);
      setSelectedCategory("");
      setActiveType("expense");
      formRef.current?.reset();
    }
  }, [open]);

  const handleFocusWithin = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA"
    ) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !open) return;
    el.addEventListener("focusin", handleFocusWithin);
    return () => el.removeEventListener("focusin", handleFocusWithin);
  }, [open, handleFocusWithin]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  /* ── Scan receipt ── */

  const handleScanClick = () => {
    if (isDesktop) {
      // Desktop: open file picker directly
      fileInputRef.current?.click();
    } else {
      // Mobile: show camera / gallery options
      setShowScanOptions(true);
    }
  };

  const handlePickCamera = () => {
    setShowScanOptions(false);
    setTimeout(() => cameraInputRef.current?.click(), 100);
  };

  const handlePickGallery = () => {
    setShowScanOptions(false);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Please select an image file" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setToast({ type: "error", message: "Image too large — max 20 MB" });
      return;
    }

    setIsScanning(true);
    try {
      // Compress image to reduce size (camera photos can be 5-15MB+)
      const base64 = await compressImage(file);
      const result = await scanReceipt(base64);

      if (result.success && result.data) {
        applyScanData(result.data);
        setToast({
          type: "success",
          message: `Scanned: ${result.data.merchant} — ${formatCurrency(result.data.amount, result.data.currency)}`,
        });
      } else {
        setToast({
          type: "error",
          message: result.error || "Failed to scan receipt",
        });
      }
    } catch {
      setToast({ type: "error", message: "Scan failed. Try again." });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
    }
  };

  const compressImage = (file: File, maxWidth = 1280, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(objectUrl); return reject(new Error("Canvas not supported")); }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl.split(",")[1]);
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Failed to load image")); };
      img.src = objectUrl;
    });

  const applyScanData = (data: ReceiptData) => {
    const form = formRef.current;
    if (!form) return;

    const amountInput = form.elements.namedItem("amount") as HTMLInputElement;
    if (amountInput) amountInput.value = String(data.amount);

    const descInput = form.elements.namedItem(
      "description"
    ) as HTMLInputElement;
    if (descInput) descInput.value = data.merchant || "";

    const dateInput = form.elements.namedItem("date") as HTMLInputElement;
    if (dateInput && data.date) dateInput.value = data.date;

    const matchedCat = categories.find(
      (c) => c.name.toLowerCase() === data.category?.toLowerCase()
    );
    if (matchedCat) setSelectedCategory(matchedCat.id);
    setActiveType("expense");
  };

  /* ── Submit ── */

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      formData.set("type", activeType);
      if (selectedCategory) formData.set("categoryId", selectedCategory);

      const result = await createTransactionAction(formData);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setOpen(false);
        }, 1400);
      } else {
        setToast({ type: "error", message: result.error });
      }
    } catch {
      setToast({ type: "error", message: "Failed to create transaction" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Shared form content ── */

  const formContent = (
    <>
      {showSuccess ? (
        /* ── Success ── */
        <div className="flex flex-col items-center justify-center py-20 md:py-24 animate-fade-in-up">
          <div className="relative mb-5">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-emerald-100 rounded-full animate-ping opacity-20" />
          </div>
          <p className="text-lg font-bold text-slate-900">
            Transaction Added!
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Your records are up to date
          </p>
        </div>
      ) : (
        <div className="px-5 md:px-7 pb-6 space-y-5">
          {/* ═══ Scan Receipt Banner ═══ */}
          <button
            type="button"
            onClick={handleScanClick}
            disabled={isScanning}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {/* Icon */}
            <div className="shrink-0 w-12 h-12 brand-gradient rounded-xl flex items-center justify-center shadow-md shadow-blue-700/15 group-hover:shadow-lg transition-shadow">
              {isScanning ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
            {/* Text */}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold text-slate-800">
                {isScanning ? "Scanning receipt…" : "Scan Receipt"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isScanning
                  ? "AI is reading your receipt"
                  : "Take a photo to auto-fill details"}
              </p>
            </div>
            {/* Badge */}
            {!isScanning && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3" />
                AI
              </span>
            )}
          </button>

          {/* ═══ Type tabs ═══ */}
          <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl">
            {(Object.keys(TYPE_CONFIG) as TransactionType[]).map((type) => {
              const tc = TYPE_CONFIG[type];
              const Icon = tc.icon;
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setActiveType(type);
                    setSelectedCategory("");
                  }}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5",
                    "py-2.5 rounded-[10px] text-[13px] font-semibold",
                    "transition-all duration-200",
                    isActive
                      ? tc.activeTab
                      : "text-slate-500 hover:text-slate-700",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" />
                  {tc.label}
                </button>
              );
            })}
          </div>

          {/* ═══ Form ═══ */}
          <form ref={formRef} action={handleSubmit} className="space-y-4">
            {/* ── Amount ── */}
            <div
              className={[
                "rounded-2xl border-2 border-slate-200 bg-slate-50/60 transition-all",
                config.focusRing,
              ].join(" ")}
            >
              <label className="block px-4 pt-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Amount
              </label>
              <div className="flex items-baseline gap-1 px-4 pb-3">
                <span className="text-base font-bold text-slate-400 select-none">
                  {getCurrencySymbol("IDR")}
                </span>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  step="1"
                  placeholder="0"
                  inputMode="numeric"
                  autoComplete="off"
                  className="amount-input flex-1 bg-transparent text-3xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none min-w-0 leading-tight"
                />
              </div>
            </div>

            {/* ── Accounts ── */}
            <div
              className={[
                "grid gap-3",
                activeType === "transfer"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1",
              ].join(" ")}
            >
              {(activeType === "expense" || activeType === "transfer") && (
                <FieldSelect
                  label={
                    activeType === "transfer" ? "From Account" : "Account"
                  }
                  name="fromAccountId"
                  accounts={accounts}
                  focusRing={config.focusRing}
                />
              )}
              {(activeType === "income" || activeType === "transfer") && (
                <FieldSelect
                  label={
                    activeType === "transfer" ? "To Account" : "Account"
                  }
                  name="toAccountId"
                  accounts={accounts}
                  focusRing={config.focusRing}
                />
              )}
            </div>

            {/* ── Category chips ── */}
            {activeType !== "transfer" && categories.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(isSelected ? "" : cat.id)
                        }
                        className={[
                          "inline-flex items-center gap-1.5 px-3 py-2",
                          "rounded-xl text-sm font-medium",
                          "border-2 transition-all duration-150",
                          isSelected
                            ? config.chipSelected
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <span className="text-base leading-none">
                          {cat.icon || "📁"}
                        </span>
                        {cat.name}
                      </button>
                    );
                  })}
                  <input
                    type="hidden"
                    name="categoryId"
                    value={selectedCategory}
                  />
                </div>
              </div>
            )}

            {/* ── Description + Date ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <div
                  className={[
                    "rounded-xl border-2 border-slate-200 transition-all",
                    config.focusRing,
                  ].join(" ")}
                >
                  <input
                    type="text"
                    name="description"
                    placeholder="What's this for?"
                    autoComplete="off"
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <div
                  className={[
                    "relative rounded-xl border-2 border-slate-200 transition-all",
                    config.focusRing,
                  ].join(" ")}
                >
                  <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  "w-full py-3.5 rounded-xl font-semibold text-white text-[15px]",
                  "transition-all duration-200 disabled:opacity-50",
                  "active:scale-[0.98]",
                  config.submitBtn,
                ].join(" ")}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  `Add ${config.label}`
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );

  /* ═══ Render ═══ */

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleScanFile}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScanFile}
        className="hidden"
      />

      {/* ═══ Mobile scan options action sheet ═══ */}
      <Drawer.Root open={showScanOptions} onOpenChange={setShowScanOptions}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[70]" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[70] outline-none flex flex-col bg-white rounded-t-[20px]"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-slate-300/80" />
            </div>
            <Drawer.Title className="px-5 pt-1 pb-3 text-lg font-bold text-slate-900">
              Scan Receipt
            </Drawer.Title>
            <div className="px-5 pb-6 space-y-2">
              <button
                type="button"
                onClick={handlePickCamera}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">Take Photo</p>
                  <p className="text-xs text-slate-500">Use camera to capture receipt</p>
                </div>
              </button>
              <button
                type="button"
                onClick={handlePickGallery}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ImageUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">Choose from Gallery</p>
                  <p className="text-xs text-slate-500">Select an existing photo</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShowScanOptions(false)}
                className="w-full py-3 mt-1 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
            <div className="pb-safe" />
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {isDesktop ? (
        /* ═══ Desktop → Radix Dialog ═══ */
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent hideCloseButton>
            {/* Header */}
            <header className="flex items-center justify-between px-7 pt-5 pb-4">
              <DialogTitle>New Transaction</DialogTitle>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Scrollable body */}
            <div ref={scrollRef} className="overflow-y-auto overscroll-contain">
              {formContent}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        /* ═══ Mobile → vaul Drawer ═══ */
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50" />

            <Drawer.Content
              className={[
                "fixed bottom-0 left-0 right-0 z-50 outline-none",
                "flex flex-col bg-white",
                "rounded-t-[20px] max-h-[94dvh]",
              ].join(" ")}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-9 h-1 rounded-full bg-slate-300/80" />
              </div>

              {/* Header */}
              <header className="flex items-center justify-between px-5 pt-1 pb-3">
                <Drawer.Title className="text-xl font-bold text-slate-900 tracking-tight">
                  New Transaction
                </Drawer.Title>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </header>

              {/* Scrollable body */}
              <div
                ref={scrollRef}
                className="overflow-y-auto overscroll-contain"
              >
                {formContent}
              </div>

              {/* Safe area */}
              <div className="pb-safe" />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}

      {/* ═══ Toast ═══ */}
      {toast && (
        <div
          className={[
            "fixed z-[60] animate-in slide-in-from-bottom-5",
            "bottom-24 left-4 right-4",
            "md:bottom-8 md:left-auto md:right-6 md:max-w-sm",
            "flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl",
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white",
          ].join(" ")}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Sub-components ────────────────────── */

function FieldSelect({
  label,
  name,
  accounts,
  focusRing,
}: {
  label: string;
  name: string;
  accounts: Account[];
  focusRing: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div
        className={[
          "relative rounded-xl border-2 border-slate-200 transition-all",
          focusRing,
        ].join(" ")}
      >
        <select
          name={name}
          required
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none appearance-none pr-9 cursor-pointer rounded-xl"
        >
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {ACCOUNT_ICONS[a.type]} {a.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
