import { PrismaClient, Role, OrderStatus, PaymentMethod } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export { Role, OrderStatus, PaymentMethod, PrismaClient };
export type {
  User,
  Address,
  Brand,
  Category,
  Product,
  ProductImage,
  SubProduct,
  CartItem,
  DeliveryZone,
  Order,
  OrderItem,
  ProjectCaseStudy,
  ProjectImage,
} from "@prisma/client";

export default prisma;
