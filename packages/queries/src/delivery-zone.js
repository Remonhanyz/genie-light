"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDeliveryZones = getAllDeliveryZones;
exports.getActiveDeliveryZones = getActiveDeliveryZones;
exports.getDeliveryZoneByGovernorate = getDeliveryZoneByGovernorate;
exports.updateDeliveryFee = updateDeliveryFee;
exports.upsertDeliveryZone = upsertDeliveryZone;
const database_1 = require("@genie-light/database");
async function getAllDeliveryZones() {
    return database_1.prisma.deliveryZone.findMany({
        orderBy: { governorate: "asc" },
    });
}
async function getActiveDeliveryZones() {
    return database_1.prisma.deliveryZone.findMany({
        where: { active: true },
        orderBy: { governorate: "asc" },
    });
}
async function getDeliveryZoneByGovernorate(governorate) {
    return database_1.prisma.deliveryZone.findUnique({
        where: { governorate },
    });
}
async function updateDeliveryFee(id, deliveryFee, estimatedDays, active) {
    return database_1.prisma.deliveryZone.update({
        where: { id },
        data: {
            deliveryFee,
            estimatedDays,
            ...(active !== undefined ? { active } : {}),
        },
    });
}
async function upsertDeliveryZone(data) {
    return database_1.prisma.deliveryZone.upsert({
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
//# sourceMappingURL=delivery-zone.js.map