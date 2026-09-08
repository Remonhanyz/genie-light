import { prisma } from "@genie-light/database";

export async function getAllDeliveryZones() {
  return prisma.deliveryZone.findMany({
    orderBy: { governorate: "asc" },
  });
}

export async function getActiveDeliveryZones() {
  return prisma.deliveryZone.findMany({
    where: { active: true },
    orderBy: { governorate: "asc" },
  });
}

export async function getDeliveryZoneByGovernorate(governorate: string) {
  return prisma.deliveryZone.findUnique({
    where: { governorate },
  });
}

export async function updateDeliveryFee(
  id: string,
  deliveryFee: number,
  estimatedDays: string,
  active?: boolean,
  governorate?: string
) {
  return prisma.deliveryZone.update({
    where: { id },
    data: {
      deliveryFee,
      estimatedDays,
      ...(active !== undefined ? { active } : {}),
      ...(governorate ? { governorate } : {}),
    },
  });
}

export async function deleteDeliveryZone(id: string) {
  return prisma.deliveryZone.delete({
    where: { id },
  });
}

export async function upsertDeliveryZone(data: {
  governorate: string;
  deliveryFee: number;
  estimatedDays: string;
  active?: boolean;
}) {
  return prisma.deliveryZone.upsert({
    where: { governorate: data.governorate },
    update: {
      deliveryFee: data.deliveryFee,
      estimatedDays: data.estimatedDays,
      active: data.active ?? true,
    },
    create: {
      governorate: data.governorate,
      deliveryFee: data.deliveryFee,
      estimatedDays: data.estimatedDays,
      active: data.active ?? true,
    },
  });
}
