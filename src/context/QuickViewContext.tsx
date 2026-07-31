"use client";

import React, { createContext, useContext, useState } from "react";

interface QuickViewContextType {
  activeProduct: any | null;
  isOpen: boolean;
  openQuickView: (product: any) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (product: any) => {
    setActiveProduct(product);
    setIsOpen(true);
  };

  const closeQuickView = () => {
    setIsOpen(false);
    setTimeout(() => setActiveProduct(null), 300); // clear after transition
  };

  return (
    <QuickViewContext.Provider value={{ activeProduct, isOpen, openQuickView, closeQuickView }}>
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error("useQuickView must be used within a QuickViewProvider");
  }
  return context;
}
