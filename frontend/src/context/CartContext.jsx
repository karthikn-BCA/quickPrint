import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cp_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pricingEstimate, setPricingEstimate] = useState({
    totalPhysicalSheets: 0,
    grandTotal: 0,
    items: [],
  });

  const [loadingEstimate, setLoadingEstimate] = useState(false);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('cp_cart_items', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  // Recalculate server-side pricing whenever cart items change
  useEffect(() => {
    if (items.length === 0) {
      setPricingEstimate({ totalPhysicalSheets: 0, grandTotal: 0, items: [] });
      return;
    }

    let isMounted = true;
    setLoadingEstimate(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const payload = items.map((it) => ({
          id: it.id,
          documentId: it.id,
          originalName: it.originalName,
          totalPages: it.pageCount,
          printType: it.printType,
          printSides: it.printSides,
          copies: it.copies,
          pageSelection: it.pageSelection,
          customPages: it.customPages,
          orientation: it.orientation,
        }));

        const res = await api.calculateEstimate(payload);
        if (res.success && isMounted) {
          setPricingEstimate({
            totalPhysicalSheets: res.totalPhysicalSheets,
            grandTotal: res.grandTotal,
            items: res.items,
          });
        }
      } catch (err) {
        console.error('Estimate calculation error:', err);
      } finally {
        if (isMounted) setLoadingEstimate(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [items]);

  // Add uploaded files to cart
  const addDocuments = (newDocs) => {
    const formatted = newDocs.map((doc) => ({
      id: doc.id,
      originalName: doc.originalName,
      fileExtension: doc.fileExtension,
      sizeBytes: doc.sizeBytes,
      pageCount: doc.pageCount,
      mimeType: doc.mimeType,
      // Default configurations
      printType: 'BW', // 'BW' | 'COLOUR'
      printSides: 'SINGLE', // 'SINGLE' | 'DOUBLE'
      copies: 1,
      pageSelection: 'ALL', // 'ALL' | 'CUSTOM'
      customPages: '',
      paperSize: 'A4',
      orientation: 'PORTRAIT', // 'PORTRAIT' | 'LANDSCAPE'
    }));

    setItems((prev) => [...prev, ...formatted]);
  };

  const updateItemConfig = (id, newConfig) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...newConfig } : item))
    );
  };

  const removeItem = async (id) => {
    try {
      await api.deleteDocument(id);
    } catch (e) {}
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem('cp_cart_items');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addDocuments,
        updateItemConfig,
        removeItem,
        clearCart,
        pricingEstimate,
        loadingEstimate,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
