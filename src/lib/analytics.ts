export const CONSENT_COOKIE_KEY = "avanya_cookie_consent";

export type ConsentStatus = "accepted" | "essential" | null;

/**
 * Checks if user has given analytics cookie consent under DPDP Act principles
 */
export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;

  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE_KEY}=([^;]*)`));
    if (match) return decodeURIComponent(match[1]) as ConsentStatus;

    const stored = localStorage.getItem(CONSENT_COOKIE_KEY);
    return stored as ConsentStatus;
  } catch {
    return null;
  }
}

/**
 * Persists cookie consent choice
 */
export function setConsent(choice: "accepted" | "essential"): void {
  if (typeof window === "undefined") return;

  try {
    // 1 year expiration
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `${CONSENT_COOKIE_KEY}=${choice}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    localStorage.setItem(CONSENT_COOKIE_KEY, choice);

    // Notify listeners
    window.dispatchEvent(new Event("avanya_consent_updated"));
  } catch (e) {
    console.error("Failed to set consent", e);
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

// -------------------------------------------------------------
// E-COMMERCE EVENT DISPATCHERS (GA4 & Meta Pixel)
// -------------------------------------------------------------

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

/**
 * Track: View Item (Product Detail View)
 */
export function trackViewItem(product: {
  id: string;
  title: string;
  price: number;
  category?: string;
}) {
  if (!hasAnalyticsConsent()) return;

  // 1. Google Analytics 4
  if (typeof window.gtag === "function") {
    window.gtag("event", "view_item", {
      currency: "INR",
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_category: product.category,
          price: product.price,
          quantity: 1,
        },
      ],
    });
  }

  // 2. Meta (Facebook) Pixel
  if (typeof window.fbq === "function") {
    window.fbq("track", "ViewContent", {
      content_name: product.title,
      content_ids: [product.id],
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
  }
}

/**
 * Track: Add to Cart
 */
export function trackAddToCart(item: {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}) {
  if (!hasAnalyticsConsent()) return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "add_to_cart", {
      currency: "INR",
      value: item.price * item.quantity,
      items: [
        {
          item_id: item.id,
          item_name: item.title,
          price: item.price,
          quantity: item.quantity,
          item_variant: `${item.color || ""} / ${item.size || ""}`.trim(),
        },
      ],
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "AddToCart", {
      content_name: item.title,
      content_ids: [item.id],
      content_type: "product",
      value: item.price * item.quantity,
      currency: "INR",
    });
  }
}

/**
 * Track: Begin Checkout
 */
export function trackBeginCheckout(items: any[], totalValue: number) {
  if (!hasAnalyticsConsent()) return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "begin_checkout", {
      currency: "INR",
      value: totalValue,
      items: items.map((it) => ({
        item_id: it.id || it.productId,
        item_name: it.title,
        price: it.unitPrice || it.price,
        quantity: it.quantity,
      })),
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      num_items: items.length,
      value: totalValue,
      currency: "INR",
    });
  }
}

/**
 * Track: Purchase Completion
 */
export function trackPurchase(order: {
  orderNumber: string;
  totalAmount: number;
  items: any[];
  shippingFee?: number;
  taxAmount?: number;
}) {
  if (!hasAnalyticsConsent()) return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "purchase", {
      transaction_id: order.orderNumber,
      value: order.totalAmount,
      currency: "INR",
      shipping: order.shippingFee || 0,
      tax: order.taxAmount || 0,
      items: order.items.map((it) => ({
        item_id: it.productId || it.id,
        item_name: it.title,
        price: it.unitPrice || it.price,
        quantity: it.quantity,
      })),
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "Purchase", {
      value: order.totalAmount,
      currency: "INR",
      content_type: "product",
    });
  }
}
