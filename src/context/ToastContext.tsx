"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle, AlertTriangle, Info, ShoppingBag } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "cart";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  image?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, image?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success", image?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, image }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const toastPortal = mounted && toasts.length > 0
    ? createPortal(
        <div
          style={{
            position: "fixed",
            top: "88px",
            left: "24px",
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "340px",
            maxWidth: "calc(100vw - 32px)",
            pointerEvents: "none",
            alignItems: "flex-start",
          }}
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center justify-between p-3.5 rounded-2xl shadow-2xl border border-gray-200 bg-white text-gray-900 animate-fade-up w-full"
              style={{
                pointerEvents: "auto",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                {toast.image ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-border flex-shrink-0 bg-gray-50">
                    <img src={toast.image} alt="product" className="w-full h-full object-cover" />
                  </div>
                ) : toast.type === "success" ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                ) : toast.type === "error" ? (
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                  </div>
                ) : toast.type === "cart" ? (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4.5 h-4.5 text-accent" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4.5 h-4.5 text-gray-600" />
                  </div>
                )}
                
                <div className="text-xs font-bold text-gray-800 pr-2 truncate">
                  {toast.message}
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={{ pointerEvents: "auto", cursor: "pointer" }}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {toastPortal}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
