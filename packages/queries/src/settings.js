"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSettings = getSystemSettings;
exports.updateSystemSettings = updateSystemSettings;
async function getSystemSettings() {
    return {
        storeName: "Genie Light - Innovative Lighting Solutions",
        currency: "EGP",
        contactEmail: "info@genielight-co.com",
        contactPhone: "+20 101 479 4281",
        codShippingFee: 60,
        maintenanceMode: false,
    };
}
async function updateSystemSettings(data) {
    const current = await getSystemSettings();
    return {
        ...current,
        ...data,
    };
}
//# sourceMappingURL=settings.js.map