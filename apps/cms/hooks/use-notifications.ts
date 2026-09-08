"use client";

import { useEffect, useState, useRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function useNotifications() {
  const [orders, setOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "lowStock">("orders");
  const [readMap, setReadMap] = useState<Record<string, number>>({});
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const knownLowStockIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  useEffect(() => {
    try {
      const storedDismissed = localStorage.getItem("genielight_dismissed_notifications");
      if (storedDismissed) {
        setDismissedIds(JSON.parse(storedDismissed));
      }

      const storedReadMap = localStorage.getItem("genielight_read_timestamps");
      if (storedReadMap) {
        const parsedMap: Record<string, number> = JSON.parse(storedReadMap);
        const now = Date.now();
        const cleanedMap: Record<string, number> = {};
        
        Object.entries(parsedMap).forEach(([id, timestamp]) => {
          if (now - timestamp <= FOURTEEN_DAYS_MS) {
            cleanedMap[id] = timestamp;
          }
        });

        setReadMap(cleanedMap);
        localStorage.setItem("genielight_read_timestamps", JSON.stringify(cleanedMap));
      } else {
        const oldStored = localStorage.getItem("genielight_read_notifications");
        if (oldStored) {
          const oldIds: string[] = JSON.parse(oldStored);
          const initialMap: Record<string, number> = {};
          const now = Date.now();
          oldIds.forEach((id) => { initialMap[id] = now; });
          setReadMap(initialMap);
          localStorage.setItem("genielight_read_timestamps", JSON.stringify(initialMap));
        }
      }
    } catch (e) {
      console.error("Failed to initialize notification state from localStorage:", e);
    }
  }, []);

  const saveReadMap = (newMap: Record<string, number>) => {
    setReadMap(newMap);
    try {
      localStorage.setItem("genielight_read_timestamps", JSON.stringify(newMap));
    } catch (e) {
      console.error("Failed to save read timestamps to localStorage:", e);
    }
  };

  const saveDismissedIds = (ids: string[]) => {
    setDismissedIds(ids);
    try {
      localStorage.setItem("genielight_dismissed_notifications", JSON.stringify(ids));
    } catch (e) {
      console.error("Failed to save dismissed notifications to localStorage:", e);
    }
  };

  const fetchNotifications = async (isSilent = false) => {
    if (isFetchingRef.current) return;
    if (isSilent && typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    if (!isSilent && !initialLoadDone.current) setIsLoading(true);
    isFetchingRef.current = true;
    try {
      const res = await fetch("/api/notifications");
      lastFetchTimeRef.current = Date.now();
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: any[] = data.orders || [];
        const incomingLowStock: any[] = data.lowStockProducts || [];

        if (initialLoadDone.current) {
          const brandNewOrders = incomingOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));
          brandNewOrders.forEach((o) => {
            toast.info(`New Order placed! Total: ${formatCurrency(o.totalAmount)}`, {
              description: `Customer: ${o.user?.username || "Guest"} • Method: ${o.paymentType}`,
              action: {
                label: "View Ledger",
                onClick: () => {
                  window.location.href = `/admin/orders?orderId=${o.id}`;
                }
              },
              duration: 7000
            });
          });

          const brandNewLowStock = incomingLowStock.filter((p) => !knownLowStockIdsRef.current.has(p.id));
          brandNewLowStock.forEach((p) => {
            toast.warning(`Low Stock Warning: "${p.name}"`, {
              description: `Only ${p.inventory} unit(s) remaining in inventory!`,
              action: {
                label: "Edit Product",
                onClick: () => {
                  window.location.href = `/admin/products/${p.id}/edit`;
                }
              },
              duration: 8000
            });
          });
        }

        incomingOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
        incomingLowStock.forEach((p) => knownLowStockIdsRef.current.add(p.id));

        setOrders(incomingOrders);
        setLowStockProducts(incomingLowStock);
        initialLoadDone.current = true;
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastFetchTimeRef.current > 30000) {
          fetchNotifications(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const now = Date.now();

  const visibleOrders = orders.filter((o) => {
    if (dismissedIds.includes(o.id)) return false;
    const readTimestamp = readMap[o.id];
    if (readTimestamp && now - readTimestamp > FOURTEEN_DAYS_MS) {
      return false;
    }
    return true;
  });

  const visibleLowStockProducts = lowStockProducts.filter((p) => {
    const notificationId = `ls_${p.id}`;
    if (dismissedIds.includes(notificationId)) return false;
    const readTimestamp = readMap[notificationId];
    if (readTimestamp && now - readTimestamp > FOURTEEN_DAYS_MS) {
      return false;
    }
    return true;
  });

  const unreadOrders = visibleOrders.filter((o) => !readMap[o.id]);
  const unreadLowStock = visibleLowStockProducts.filter((p) => !readMap[`ls_${p.id}`]);
  const unreadCount = unreadOrders.length + unreadLowStock.length;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!readMap[id]) {
      saveReadMap({ ...readMap, [id]: Date.now() });
    }
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMap = { ...readMap };
    const timestamp = Date.now();
    visibleOrders.forEach((o) => {
      if (!newMap[o.id]) newMap[o.id] = timestamp;
    });
    visibleLowStockProducts.forEach((p) => {
      const nid = `ls_${p.id}`;
      if (!newMap[nid]) newMap[nid] = timestamp;
    });
    saveReadMap(newMap);
    toast.success("All notifications marked as read");
  };

  const handleRemoveNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveDismissedIds([...dismissedIds, id]);
    toast.success("Notification removed.");
  };

  return {
    activeTab,
    setActiveTab,
    readMap,
    isLoading,
    visibleOrders,
    visibleLowStockProducts,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleRemoveNotification,
  };
}
