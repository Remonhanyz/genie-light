import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  // Sample lighting catalog data
  const sampleData = [
    {
      "Product Name": "Philips BVP150 Essential SmartBright G3",
      "Brand": "Philips",
      "Category": "Floodlights & High Bay",
      "Short Description": "Compact and sturdy die-cast aluminum LED floodlight",
      "Description": "High efficiency outdoor floodlight for architectural, landscape, and perimeter security illumination.",
      "Featured": "Yes",
      "Product Active": "Yes",
      "Images": "/images/products/philips-bvp150-front.jpg, /images/products/philips-bvp150-bracket.jpg",
      "SKU": "PHI-BVP150-10W-3K-IP65",
      "Model Number": "BVP150 LED9/WW 10W 220-240V",
      "Wattage (W)": 10,
      "Luminous Flux (lm)": 950,
      "CCT (Kelvin)": 3000,
      "CRI": 80,
      "Beam Angle": "110°",
      "IP Rating": "IP65",
      "Input Voltage": "220-240V",
      "Dimensions": "140 x 110 x 28 mm",
      "Other Details": "Die-cast aluminum housing, 30,000h lifetime, IK06 impact resistance",
      "Price (EGP)": 450,
      "Sale Price (EGP)": 390,
      "Stock": 120,
      "Datasheet URL": "https://example.com/datasheets/bvp150-10w.pdf",
      "Variation Active": "Yes",
    },
    {
      "Product Name": "Philips BVP150 Essential SmartBright G3",
      "Brand": "Philips",
      "Category": "Floodlights & High Bay",
      "Short Description": "Compact and sturdy die-cast aluminum LED floodlight",
      "Description": "High efficiency outdoor floodlight for architectural, landscape, and perimeter security illumination.",
      "Featured": "Yes",
      "Product Active": "Yes",
      "Images": "/images/products/philips-bvp150-front.jpg, /images/products/philips-bvp150-bracket.jpg",
      "SKU": "PHI-BVP150-20W-4K-IP65",
      "Model Number": "BVP150 LED19/NW 20W 220-240V",
      "Wattage (W)": 20,
      "Luminous Flux (lm)": 1900,
      "CCT (Kelvin)": 4000,
      "CRI": 80,
      "Beam Angle": "110°",
      "IP Rating": "IP65",
      "Input Voltage": "220-240V",
      "Dimensions": "170 x 130 x 30 mm",
      "Other Details": "Die-cast aluminum housing, 30,000h lifetime, IK06 impact resistance",
      "Price (EGP)": 680,
      "Sale Price (EGP)": 600,
      "Stock": 85,
      "Datasheet URL": "",
      "Variation Active": "Yes",
    },
    {
      "Product Name": "Philips BVP150 Essential SmartBright G3",
      "Brand": "Philips",
      "Category": "Floodlights & High Bay",
      "Short Description": "Compact and sturdy die-cast aluminum LED floodlight",
      "Description": "High efficiency outdoor floodlight for architectural, landscape, and perimeter security illumination.",
      "Featured": "Yes",
      "Product Active": "Yes",
      "Images": "/images/products/philips-bvp150-front.jpg, /images/products/philips-bvp150-bracket.jpg",
      "SKU": "PHI-BVP150-50W-65K-IP65",
      "Model Number": "BVP150 LED48/CW 50W 220-240V",
      "Wattage (W)": 50,
      "Luminous Flux (lm)": 4750,
      "CCT (Kelvin)": 6500,
      "CRI": 80,
      "Beam Angle": "110°",
      "IP Rating": "IP65",
      "Input Voltage": "220-240V",
      "Dimensions": "205 x 165 x 35 mm",
      "Other Details": "High output floodlight, IK06",
      "Price (EGP)": 1250,
      "Sale Price (EGP)": "",
      "Stock": 40,
      "Datasheet URL": "",
      "Variation Active": "Yes",
    },
    {
      "Product Name": "Venice Architectural Deep Recessed Downlight",
      "Brand": "Schneider",
      "Category": "Downlights & Spotlights",
      "Short Description": "Anti-glare UGR<19 architectural downlight",
      "Description": "Designed for luxury residential and commercial hospitality with deep baffle anti-glare optical design.",
      "Featured": "No",
      "Product Active": "Yes",
      "Images": "",
      "SKU": "SCH-VEN-15W-3K-IP44",
      "Model Number": "VEN-RD-15W-30K",
      "Wattage (W)": 15,
      "Luminous Flux (lm)": 1350,
      "CCT (Kelvin)": 3000,
      "CRI": 90,
      "Beam Angle": "36°",
      "IP Rating": "IP44",
      "Input Voltage": "220-240V",
      "Dimensions": "Cutout: 95mm, Dia: 105mm",
      "Other Details": "Deep recessed baffle, UGR<19, Phase cut dimmable driver included",
      "Price (EGP)": 850,
      "Sale Price (EGP)": 750,
      "Stock": 60,
      "Datasheet URL": "",
      "Variation Active": "Yes",
    },
  ];

  const guideData = [
    { Field: "Product Name", Required: "YES", Description: "Commercial product name. Rows with identical Product Names will be grouped under the same parent product with multiple variations." },
    { Field: "Brand", Required: "YES", Description: "Partner brand name (e.g. Philips, Schneider, Osram, Ledvance, Elsewedy, Fumagalli). If it does not exist, it will be automatically created." },
    { Field: "Category", Required: "YES", Description: "Lighting taxonomy category (e.g. Floodlights & High Bay, Downlights & Spotlights, Linear & Profile Lighting). If it does not exist, it will be created." },
    { Field: "Short Description", Required: "NO", Description: "1-2 sentence brief commercial overview." },
    { Field: "Description", Required: "YES", Description: "Detailed architectural and photometric description." },
    { Field: "Featured", Required: "NO", Description: "'Yes' or 'No'. Displays product on homepage / project showcase." },
    { Field: "Product Active", Required: "NO", Description: "'Yes' or 'No' (defaults to Yes)." },
    { Field: "Images", Required: "NO", Description: "Comma-separated URLs or local paths (e.g. https://.../pic1.jpg, https://.../pic2.jpg)." },
    { Field: "SKU", Required: "YES", Description: "Unique child variation SKU code (e.g. PHI-BVP150-10W-3K-IP65). Must be unique across all products." },
    { Field: "Model Number", Required: "NO", Description: "Factory manufacturer model / order code." },
    { Field: "Wattage (W)", Required: "NO", Description: "Rated power in Watts (number, e.g. 10, 20, 50, 100)." },
    { Field: "Luminous Flux (lm)", Required: "NO", Description: "Luminous output in lumens (number, e.g. 950, 1900, 4750)." },
    { Field: "CCT (Kelvin)", Required: "NO", Description: "Correlated Color Temperature: 3000 (Warm), 4000 (Neutral), 6500 (Cool Daylight)." },
    { Field: "CRI", Required: "NO", Description: "Color Rendering Index: e.g. 80, 90." },
    { Field: "Beam Angle", Required: "NO", Description: "Optical distribution angle (e.g. 15°, 24°, 36°, 60°, 110°)." },
    { Field: "IP Rating", Required: "NO", Description: "Ingress Protection rating (e.g. IP20, IP44, IP65, IP66, IP67)." },
    { Field: "Input Voltage", Required: "NO", Description: "Operating electrical voltage (e.g. 220-240V)." },
    { Field: "Dimensions", Required: "NO", Description: "Physical dimensions or cut-out size (e.g. 140x110x28mm)." },
    { Field: "Other Details", Required: "NO", Description: "Housing material, warranty, optics notes, IK rating." },
    { Field: "Price (EGP)", Required: "YES", Description: "Base commercial price in Egyptian Pounds (number)." },
    { Field: "Sale Price (EGP)", Required: "NO", Description: "Promotional or discounted price in EGP." },
    { Field: "Stock", Required: "NO", Description: "Available inventory quantity (defaults to 0)." },
    { Field: "Datasheet URL", Required: "NO", Description: "Direct URL to technical PDF datasheet." },
    { Field: "Variation Active", Required: "NO", Description: "'Yes' or 'No' (defaults to Yes)." },
  ];

  const wb = XLSX.utils.book_new();

  const wsProducts = XLSX.utils.json_to_sheet(sampleData);
  // Column widths for products sheet
  wsProducts["!cols"] = [
    { wch: 35 }, // Product Name
    { wch: 15 }, // Brand
    { wch: 25 }, // Category
    { wch: 35 }, // Short Description
    { wch: 45 }, // Description
    { wch: 10 }, // Featured
    { wch: 14 }, // Product Active
    { wch: 30 }, // Images
    { wch: 25 }, // SKU
    { wch: 25 }, // Model Number
    { wch: 12 }, // Wattage (W)
    { wch: 18 }, // Luminous Flux (lm)
    { wch: 14 }, // CCT (Kelvin)
    { wch: 8 },  // CRI
    { wch: 12 }, // Beam Angle
    { wch: 12 }, // IP Rating
    { wch: 14 }, // Input Voltage
    { wch: 22 }, // Dimensions
    { wch: 35 }, // Other Details
    { wch: 14 }, // Price (EGP)
    { wch: 16 }, // Sale Price (EGP)
    { wch: 10 }, // Stock
    { wch: 35 }, // Datasheet URL
    { wch: 16 }, // Variation Active
  ];

  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide["!cols"] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 70 },
  ];

  XLSX.utils.book_append_sheet(wb, wsProducts, "Products & Variations");
  XLSX.utils.book_append_sheet(wb, wsGuide, "Column Guide & Instructions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="genie-light-batch-products-template.xlsx"`,
    },
  });
}
