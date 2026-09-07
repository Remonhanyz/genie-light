import { NextRequest } from "next/server";
import { prisma } from "@genie-light/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          console.error("SSE enqueue error:", e);
        }
      };

      // Send connected event immediately
      sendEvent({ type: "CONNECTED" });

      // Keep connection alive with a ping event every 20 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(pingInterval);
        }
      }, 20000);

      let lastCheckedTime = new Date();

      // Check database every 10 seconds for new orders and low stock products
      const checkInterval = setInterval(async () => {
        try {
          const newOrders = await prisma.order.findMany({
            where: {
              createdAt: {
                gt: lastCheckedTime,
              },
            },
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          });

          if (newOrders.length > 0) {
            lastCheckedTime = newOrders[0].createdAt;
            sendEvent({
              type: "NEW_ORDERS",
              orders: newOrders.map((o) => ({
                ...o,
                user: { username: o.user.name, email: o.user.email },
                totalAmount: Number(o.total),
              })),
            });
          }

          const lowStockSubProducts = await prisma.subProduct.findMany({
            where: {
              stockQuantity: {
                lte: 5,
              },
              active: true,
            },
            orderBy: { stockQuantity: "asc" },
            take: 10,
            include: {
              product: {
                include: { category: true },
              },
            },
          });

          sendEvent({
            type: "LOW_STOCK",
            products: lowStockSubProducts.map((sp) => ({
              id: sp.id,
              name: `${sp.product.name} (${sp.sku})`,
              inventory: sp.stockQuantity,
              category: sp.product.category,
            })),
          });
        } catch (e) {
          console.error("SSE interval check error:", e);
        }
      }, 10000);

      // Clean up on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        clearInterval(checkInterval);
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
