"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  coupon: string | null;
  discountPercent: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getCartSubtotal: () => number;
  getDiscountAmount: () => number;
  getCartTotal: () => number;
  shippingFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const shippingFee = 15;

  // Hydrate cart from user-specific localStorage whenever user changes
  useEffect(() => {
    // If not logged in, cart is always empty (0 items shown on header badge)
    if (!user) {
      setCartItems([]);
      return;
    }

    const storageKey = `app_cart_${user.username}`;
    const savedCart = localStorage.getItem(storageKey);
    let currentCart: CartItem[] = [];
    if (savedCart) {
      try {
        currentCart = JSON.parse(savedCart);
        setCartItems(currentCart);
      } catch (err) {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }

    // Auto-process pending add-to-cart when user logs in
    const pendingStr = localStorage.getItem("pending_add_to_cart");
    if (pendingStr) {
      try {
        const { product, quantity } = JSON.parse(pendingStr);
        localStorage.removeItem("pending_add_to_cart");

        const qty = quantity || 1;
        const existingIndex = currentCart.findIndex((i) => i.id === product.id);
        let newCart = [...currentCart];

        if (existingIndex > -1) {
          const nextQty = newCart[existingIndex].quantity + qty;
          newCart[existingIndex].quantity = Math.min(nextQty, product.stock);
        } else {
          newCart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            quantity: Math.min(qty, product.stock),
            stock: product.stock,
          });
        }

        setCartItems(newCart);
        localStorage.setItem(storageKey, JSON.stringify(newCart));
        setIsCartOpen(true);
        showToast(`Đã tự động thêm ${product.title} vào giỏ hàng!`, "cart", product.thumbnail);
      } catch {
        localStorage.removeItem("pending_add_to_cart");
      }
    }
  }, [user?.username]);

  // Sync cart to localStorage on change
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (user) {
      localStorage.setItem(`app_cart_${user.username}`, JSON.stringify(items));
    }
  };

  const addToCart = (product: any, quantity = 1) => {
    // If not logged in, save pending product and redirect to login
    if (!user) {
      localStorage.setItem("pending_add_to_cart", JSON.stringify({ product, quantity }));
      showToast("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "info");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    const existingIndex = cartItems.findIndex((item) => item.id === product.id);
    let newCart = [...cartItems];

    if (existingIndex > -1) {
      const nextQty = newCart[existingIndex].quantity + quantity;
      if (nextQty <= product.stock) {
        newCart[existingIndex].quantity = nextQty;
      } else {
        newCart[existingIndex].quantity = product.stock;
      }
    } else {
      newCart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
      });
    }

    saveCart(newCart);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    const newCart = cartItems.filter((item) => item.id !== productId);
    saveCart(newCart);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const newCart = cartItems.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCoupon(null);
    setDiscountPercent(0);
  };

  const applyCoupon = (code: string): boolean => {
    const sanitized = code.toUpperCase().trim();
    if (sanitized === "ANTIGRAVITY") {
      setCoupon("ANTIGRAVITY (Giảm 30%)");
      setDiscountPercent(30);
      return true;
    } else if (sanitized === "SALE20") {
      setCoupon("SALE20 (Giảm 20%)");
      setDiscountPercent(20);
      return true;
    } else if (sanitized === "FREESHIP") {
      setCoupon("FREESHIP (Giảm 10%)");
      setDiscountPercent(10);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountPercent(0);
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    const sub = getCartSubtotal();
    return (sub * discountPercent) / 100;
  };

  const getCartTotal = () => {
    const sub = getCartSubtotal();
    const discount = getDiscountAmount();
    if (sub === 0) return 0;
    return sub - discount + shippingFee;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        coupon,
        discountPercent,
        applyCoupon,
        removeCoupon,
        getCartSubtotal,
        getDiscountAmount,
        getCartTotal,
        shippingFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
