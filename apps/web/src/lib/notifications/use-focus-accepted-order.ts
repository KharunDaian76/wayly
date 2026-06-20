'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useAppMode } from '@/lib/app-mode/app-mode-context';
import {
  acceptedOrderElementId,
  scrollToAcceptedOrder,
  scrollToAcceptedPanel,
  type AcceptedOrdersPanel,
} from '@/lib/notifications/notification-order-focus';

const HIGHLIGHT_MS = 2500;
const SCROLL_DELAY_MS = 50;

export interface FocusAcceptedOrderCallOptions<T extends { id: string }> {
  openDetails?: boolean;
  onOpenDetails?: (order: T, panel: AcceptedOrdersPanel) => void;
}

interface UseFocusAcceptedOrderOptions<T extends { id: string }> {
  setHighlightedOrderId: (orderId: string | null) => void;
  loadSenderAcceptedOrders: () => Promise<readonly T[]>;
  loadAcceptedOrders: () => Promise<readonly T[]>;
}

export function useFocusAcceptedOrder<T extends { id: string }>({
  setHighlightedOrderId,
  loadSenderAcceptedOrders,
  loadAcceptedOrders,
}: UseFocusAcceptedOrderOptions<T>) {
  const { setMode } = useAppMode();
  const scrollTimeoutRef = useRef<number | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const focusAcceptedOrder = useCallback(
    async (
      orderId: string,
      panelHint?: AcceptedOrdersPanel,
      callOptions?: FocusAcceptedOrderCallOptions<T>,
    ) => {
      if (highlightTimeoutRef.current !== null) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      setHighlightedOrderId(null);

      const primary: AcceptedOrdersPanel = panelHint ?? 'sender';
      const secondary: AcceptedOrdersPanel = primary === 'sender' ? 'wayler' : 'sender';

      let matchedOrder: T | undefined;

      const loadPanel = async (panel: AcceptedOrdersPanel): Promise<boolean> => {
        setMode(panel);
        const orders =
          panel === 'sender' ? await loadSenderAcceptedOrders() : await loadAcceptedOrders();
        const order = orders.find((item) => item.id === orderId);
        if (order) {
          matchedOrder = order;
          return true;
        }
        return false;
      };

      let targetPanel = primary;
      let found = await loadPanel(primary);
      if (!found) {
        targetPanel = secondary;
        found = await loadPanel(secondary);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollTimeoutRef.current = null;
        if (found) {
          scrollToAcceptedOrder(orderId);
          setHighlightedOrderId(orderId);
          highlightTimeoutRef.current = window.setTimeout(() => {
            setHighlightedOrderId(null);
            highlightTimeoutRef.current = null;
          }, HIGHLIGHT_MS);

          if (matchedOrder && callOptions?.openDetails && callOptions.onOpenDetails) {
            callOptions.onOpenDetails(matchedOrder, targetPanel);
          }
        } else {
          scrollToAcceptedPanel(targetPanel);
        }
      }, SCROLL_DELAY_MS);
    },
    [setMode, loadSenderAcceptedOrders, loadAcceptedOrders, setHighlightedOrderId],
  );

  return focusAcceptedOrder;
}

export { acceptedOrderElementId };
