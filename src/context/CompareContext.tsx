"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface CompareContextType {
  compareItems: any[];
  addToCompare: (product: any) => boolean; // returns true if added, false if full (max 4)
  removeFromCompare: (productId: number) => void;
  isInCompare: (productId: number) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("app_compare");
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (err) {
        console.error("Error parsing compare storage:", err);
      }
    }
  }, []);

  const saveCompare = (items: any[]) => {
    setCompareItems(items);
    localStorage.setItem("app_compare", JSON.stringify(items));
  };

  const addToCompare = (product: any): boolean => {
    const exists = compareItems.some((item) => item.id === product.id);
    if (exists) {
      removeFromCompare(product.id);
      return true;
    }

    if (compareItems.length >= 4) {
      return false; // Limit to 4 items
    }

    const next = [...compareItems, product];
    saveCompare(next);
    return true;
  };

  const removeFromCompare = (productId: number) => {
    const next = compareItems.filter((item) => item.id !== productId);
    saveCompare(next);
  };

  const isInCompare = (productId: number) => {
    return compareItems.some((item) => item.id === productId);
  };

  const clearCompare = () => {
    saveCompare([]);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
