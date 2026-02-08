"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { scanReceipt, type ReceiptData } from "@/app/actions/scan-receipt";

interface ScanReceiptButtonProps {
  onScanComplete: (data: ReceiptData) => void;
  disabled?: boolean;
  className?: string;
}

export function ScanReceiptButton({
  onScanComplete,
  disabled = false,
  className = "",
}: ScanReceiptButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "Image is too large. Please use an image under 10MB.");
      return;
    }

    setIsScanning(true);

    try {
      const base64 = await convertFileToBase64(file);
      const result = await scanReceipt(base64);

      if (result.success && result.data) {
        onScanComplete(result.data);
        showToast(
          "success",
          `Receipt scanned! Found: ${result.data.merchant} - Rp ${result.data.amount.toLocaleString("id-ID")}`
        );
      } else {
        showToast("error", result.error || "Failed to scan receipt");
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      showToast("error", "Failed to process receipt. Please try again.");
    } finally {
      setIsScanning(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isScanning}
      />

      {/* Scan button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || isScanning}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isScanning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4" />
            Scan Receipt
          </>
        )}
      </button>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
