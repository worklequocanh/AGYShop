"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistItems: any[];
  toggleWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  const storageKey = user ? `app_wishlist_${user.username}` : "app_wishlist_guest";

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setWishlistItems(JSON.parse(saved));
      } catch (err) {
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }
  }, [user?.username, storageKey]);

  const saveWishlist = (items: any[]) => {
    setWishlistItems(items);
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const toggleWishlist = (product: any) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    let next;
    if (exists) {
      next = wishlistItems.filter((item) => item.id !== product.id);
    } else {
      next = [...wishlistItems, product];
    }
    saveWishlist(next);
  };

  const removeFromWishlist = (productId: number) => {
    const next = wishlistItems.filter((item) => item.id !== productId);
    saveWishlist(next);
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
