import { logger } from "../utils/logger";
import { formatINR } from "@/lib/utils";

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    title: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountAmount: number;
  couponCode?: string | null;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
  };
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "AVANYA Atelier <orders@avanya.in>";

  const itemsHtml = order.items
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #E5E0D8;">
        <td style="padding: 12px 0;">
          <strong style="color: #111111; font-family: Georgia, serif;">${it.title}</strong><br/>
          <span style="font-size: 12px; color: #666666;">Size: ${it.size} | Color: ${it.color} | Qty: ${it.quantity}</span>
        </td>
        <td style="padding: 12px 0; text-align: right; color: #111111; font-weight: 600;">
          ${formatINR(it.totalPrice)}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation • ${order.orderNumber}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 40px 20px; color: #111111;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <!-- Header -->
        <div style="background-color: #111111; padding: 32px 24px; text-align: center; color: #FAF8F5;">
          <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 4px; margin: 0; color: #FFFFFF;">AVANYA</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C5A880; margin: 8px 0 0;">Haute Couture & Heritage Silks</p>
        </div>

        <div style="padding: 32px 24px;">
          <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #111111; margin-top: 0;">
            Thank you for your patronage, ${order.customerName}.
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">
            Your bespoke order <strong style="color: #0B5D4B;">${order.orderNumber}</strong> has been confirmed and transferred to our master artisans for inspection and fragrance-sealed keepsake packaging.
          </p>

          <!-- Order Summary Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #111111; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666666;">
                <th style="padding-bottom: 8px; text-align: left;">Masterpiece</th>
                <th style="padding-bottom: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Financial Breakdown -->
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E5E0D8; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #666666;">
              <span>Subtotal:</span>
              <span>${formatINR(order.subtotal)}</span>
            </div>
            ${
              order.discountAmount > 0
                ? `<div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #0B5D4B; font-weight: 600;">
                    <span>Discount (${order.couponCode || "Coupon"}):</span>
                    <span>-${formatINR(order.discountAmount)}</span>
                  </div>`
                : ""
            }
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #666666;">
              <span>Estimated GST (12% Included):</span>
              <span>${formatINR(order.taxAmount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #666666;">
              <span>Express Air Shipping:</span>
              <span>${order.shippingFee === 0 ? "FREE" : formatINR(order.shippingFee)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #111111; font-size: 16px; font-weight: 700; color: #111111;">
              <span>Total Paid (${order.paymentMethod}):</span>
              <span>${formatINR(order.totalAmount)}</span>
            </div>
          </div>

          <!-- Shipping Details -->
          <div style="margin-top: 28px; background-color: #FAF8F5; padding: 16px; rounded: 12px; border: 1px solid #E5E0D8; font-size: 13px;">
            <strong style="color: #111111; font-family: Georgia, serif; font-size: 14px;">Consignment Destination:</strong>
            <p style="margin: 6px 0 0; color: #4A4A4A; line-height: 1.5;">
              ${order.shippingAddress.addressLine1}${order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
              India
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #FAF8F5; padding: 24px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #E5E0D8;">
          <p style="margin: 0;">For bespoke styling assistance or consignment tracking, contact our WhatsApp Concierge at +91 98765 43210.</p>
          <p style="margin: 8px 0 0;">© 2026 AVANYA Atelier Pvt. Ltd. Bengaluru • Mumbai • New Delhi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!apiKey || apiKey.includes("placeholder")) {
    logger.info(
      { orderNumber: order.orderNumber, recipient: order.customerEmail, total: order.totalAmount },
      "Resend API running in local test mode. Order confirmation email rendered successfully."
    );
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [order.customerEmail],
        subject: `Your AVANYA Order is Confirmed • ${order.orderNumber}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      logger.error({ err }, "Resend API returned error");
      return false;
    }

    logger.info({ orderNumber: order.orderNumber }, "Order confirmation email delivered successfully via Resend");
    return true;
  } catch (err) {
    logger.error({ err }, "Failed to send order confirmation email via Resend");
    return false;
  }
}
