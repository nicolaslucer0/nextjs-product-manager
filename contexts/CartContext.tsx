"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

export type CanjeData = {
  model: string;
  storage: string;
  battery: string;
  aestheticDetail: boolean;
  changedParts: boolean;
  worksPerfectly: boolean;
  discount: number; // monto que se descuenta del precio
};

export type CartItem = {
  _id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  planCanje?: boolean;
  canje?: CanjeData;
};

type CartContextType = {
  items: CartItem[];
  addItem: (
    product: { _id: string; title: string; price: number; images: string[]; stock: number; planCanje?: boolean },
    quantity: number,
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCanje: (id: string, canje: CanjeData) => void;
  removeCanje: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cart";

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(loadCart());
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback(
    (
      product: { _id: string; title: string; price: number; images: string[]; stock: number; planCanje?: boolean },
      quantity: number,
    ) => {
      setItems((prev) => {
        const existing = prev.find((i) => i._id === product._id);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, product.stock);
          return prev.map((i) =>
            i._id === product._id ? { ...i, quantity: newQty } : i,
          );
        }
        return [
          ...prev,
          {
            _id: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || "",
            quantity: Math.min(quantity, product.stock),
            stock: product.stock,
            planCanje: product.planCanje,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i._id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i,
      ),
    );
  }, []);

  const applyCanje = useCallback((id: string, canje: CanjeData) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, canje } : i)),
    );
  }, []);

  const removeCanje = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, canje: undefined } : i)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, i) => {
        const unitPrice = i.canje ? Math.max(0, i.price - i.canje.discount) : i.price;
        return sum + unitPrice * i.quantity;
      }, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      applyCanje,
      removeCanje,
      clearCart,
      totalItems,
      totalPrice,
      isOpen,
      setIsOpen,
    }),
    [items, addItem, removeItem, updateQuantity, applyCanje, removeCanje, clearCart, totalItems, totalPrice, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
