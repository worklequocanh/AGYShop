"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Currency = "USD" | "VND";

interface CurrencyContextType {
  currency: Currency;
  toggleCurrency: () => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");

  useEffect(() => {
    const saved = localStorage.getItem("app_currency") as Currency;
    if (saved) setCurrency(saved);
  }, []);

  const toggleCurrency = () => {
    const next = currency === "USD" ? "VND" : "USD";
    setCurrency(next);
    localStorage.setItem("app_currency", next);
  };

  const convertPrice = (priceInUSD: number) => {
    if (currency === "VND") {
      return Math.round(priceInUSD * 25400); // 1 USD = 25400 VND
    }
    return priceInUSD;
  };

  const formatPrice = (priceInUSD: number) => {
    const converted = convertPrice(priceInUSD);
    if (currency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(converted);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
