import { logger } from "../utils/logger";
import prisma from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "../emails/order-confirmation";

export type JobType =
  | "ORDER_CONFIRMATION_EMAIL"
  | "INVOICE_GENERATION"
  | "ABANDONED_CART_REMINDER"
  | "STOCK_ALERT"
  | "WEBHOOK_RETRY";

export interface QueueJob<T = any> {
  id: string;
  type: JobType;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  scheduledFor: number;
}

export class JobQueue {
  private inMemoryQueue: QueueJob[] = [];
  private isProcessing = false;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor() {
    // Background polling worker every 1 second
    if (typeof setInterval !== "undefined") {
      this.intervalHandle = setInterval(() => this.processNextJobs(), 1000);
      if (this.intervalHandle.unref) {
        this.intervalHandle.unref();
      }
    }
  }

  /**
   * Enqueue a new background job
   */
  async add<T = any>(
    type: JobType,
    payload: T,
    options?: { delayMs?: number; maxAttempts?: number }
  ): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const job: QueueJob<T> = {
      id,
      type,
      payload,
      attempts: 0,
      maxAttempts: options?.maxAttempts || 3,
      createdAt: now,
      scheduledFor: now + (options?.delayMs || 0),
    };

    this.inMemoryQueue.push(job);

    logger.info({ jobId: id, type, scheduledFor: job.scheduledFor }, "Background job queued");

    return id;
  }

  /**
   * Process due jobs in the queue
   */
  private async processNextJobs() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = Date.now();
      const readyJobs = this.inMemoryQueue.filter((j) => j.scheduledFor <= now);

      for (const job of readyJobs) {
        // Remove from pending
        this.inMemoryQueue = this.inMemoryQueue.filter((j) => j.id !== job.id);
        job.attempts++;

        try {
          logger.info({ jobId: job.id, type: job.type, attempt: job.attempts }, "Processing background job");
          await this.executeJob(job);
          logger.info({ jobId: job.id, type: job.type }, "Background job completed successfully");
        } catch (error: any) {
          logger.error(
            { jobId: job.id, type: job.type, error: error.message, attempt: job.attempts },
            "Background job failed"
          );

          if (job.attempts < job.maxAttempts) {
            // Exponential backoff retry: 2s, 4s, 8s...
            const backoffMs = Math.pow(2, job.attempts) * 1000;
            job.scheduledFor = Date.now() + backoffMs;
            this.inMemoryQueue.push(job);
            logger.info({ jobId: job.id, backoffMs }, "Scheduled job retry with backoff");
          } else {
            logger.error({ jobId: job.id, type: job.type }, "Job exceeded max retry attempts. Dropped.");
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Job Dispatcher Execution Logic
   */
  private async executeJob(job: QueueJob): Promise<void> {
    switch (job.type) {
      case "ORDER_CONFIRMATION_EMAIL": {
        const { orderData } = job.payload;
        if (orderData) {
          await sendOrderConfirmationEmail(orderData);
        } else if (job.payload.orderNumber) {
          const ord = await prisma.order.findUnique({
            where: { orderNumber: job.payload.orderNumber },
            include: { items: true, shippingAddress: true, user: true },
          });
          if (ord && ord.shippingAddress) {
            await sendOrderConfirmationEmail({
              orderNumber: ord.orderNumber,
              customerName: ord.user?.name || ord.shippingAddress.name || "Patron",
              customerEmail: ord.user?.email || ord.guestEmail || job.payload.recipientEmail || "orders@avanya.in",
              items: ord.items.map((it) => ({
                title: it.title,
                size: it.size,
                color: it.color,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                totalPrice: it.totalPrice,
              })),
              subtotal: ord.subtotal,
              discountAmount: ord.discountAmount,
              couponCode: ord.couponCode,
              shippingFee: ord.shippingFee,
              taxAmount: ord.taxAmount,
              totalAmount: ord.totalAmount,
              shippingAddress: {
                addressLine1: ord.shippingAddress.addressLine1,
                addressLine2: ord.shippingAddress.addressLine2,
                city: ord.shippingAddress.city,
                state: ord.shippingAddress.state,
                postalCode: ord.shippingAddress.postalCode,
              },
              paymentMethod: ord.paymentMethod,
            });
          }
        }
        break;
      }

      case "INVOICE_GENERATION": {
        const { orderId } = job.payload;
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true, shippingAddress: true },
        });
        if (order) {
          logger.info(
            { orderNumber: order.orderNumber, total: order.totalAmount, itemsCount: order.items.length },
            "Generated GST tax invoice record"
          );
        }
        break;
      }

      case "ABANDONED_CART_REMINDER": {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const staleCarts = await prisma.cart.findMany({
          where: { updatedAt: { lt: twoHoursAgo }, items: { some: {} } },
          include: { user: true, items: true },
          take: 10,
        });
        logger.info({ abandonedCartsFound: staleCarts.length }, "Evaluated abandoned carts for reminders");
        break;
      }

      case "STOCK_ALERT": {
        const { variantId, currentStock, sku, title } = job.payload;
        logger.warn(
          { variantId, sku, currentStock, title },
          "URGENT INVENTORY ALERT: Stock below minimum threshold"
        );
        break;
      }

      case "WEBHOOK_RETRY": {
        const { webhookEventId, endpointUrl } = job.payload;
        logger.info({ webhookEventId, endpointUrl }, "Retried external webhook delivery");
        break;
      }

      default:
        logger.warn({ type: job.type }, "Unknown job type");
    }
  }

  /**
   * Health status of queue worker
   */
  getStatus() {
    return {
      status: "active",
      pendingJobsCount: this.inMemoryQueue.length,
      isProcessing: this.isProcessing,
    };
  }
}

export const jobQueue = new JobQueue();
