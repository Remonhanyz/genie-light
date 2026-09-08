export interface SystemSettings {
  storeName: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  codShippingFee?: number;
  maintenanceMode?: boolean;
  [key: string]: any;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  return {
    storeName: "Genie Light - Innovative Lighting Solutions",
    currency: "EGP",
    contactEmail: "info@genielight-co.com",
    contactPhone: "+20 101 479 4281",
    codShippingFee: 60,
    maintenanceMode: false,
  };
}

export async function updateSystemSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
  const current = await getSystemSettings();
  return {
    ...current,
    ...data,
  };
}
